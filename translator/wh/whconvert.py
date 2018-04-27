#!/usr/bin/env python
#coding=utf-8

import logging
from collections import OrderedDict
import wh.whlex
import wh.whparser
from wh.utils import clear_error, add_error, get_errors


logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


class WhProgram(object):
    function_map = {
        # WH函数到本地函数名映射表 (WH函数签名, TQ函数名)
        # 签名首位: I=需要i作为首参数,且需缓存序列; i=需要i作为首参数,但不需缓存序列; N=不需要i作为首参数
        "REF": [["iSV", "REF(i, {0}, {1})"]],
        "HHV": [["iSV", "HIGHEST(i, {0}, {1})"]],
        "LLV": [["iSV", "LOWEST(i, {0}, {1})"]],
        "BARSLAST": [["iS", "(i - NEAREST(i, {0}))"]],
        "EVERY": [["iSV", "EVERY(i, {0}, {1})"]],
        "ISLASTBAR": [["i", "C.ISLAST(i)"]],
        "VALUEWHEN": [["iSS", "{1}[NEAREST(i, {0})]"]],
        "BARPOS": [["i", "i"]],
        "DATE": [["i", "DATE(C.DS[i].datetime)"]],
        "TIME": [["i", "TIME(C.DS[i].datetime)"]],
        "MA": [["ISV", "MA(i, {0}, {1}, {2})"]],
        "STD": [["ISV", "STDEV(i, {0}, {1}, {2})"]],
        "EMA": [["ISV", "EMA(i, {0}, {1}, {2})"]],
        "EMA2": [["ISV", "EMA(i, {0}, {1}, {2})"]],
        "DMA": [["ISV", "DMA(i, {0}, {1}, {2})"]],
        "SUM": [["ISV", "SUM(i, {0}, {1}, {2})"]],
        "COUNT": [["ISV", "COUNT(i, {0}, {1}, {2})"]],
        "SMA": [["ISVV", "SMA(i, {0}, {1}, {2}, {3})"]],
        "ABS": [["NV", "ABS({0})"]],
        "MAX": [["NVV", "MAX({0}, {1})"]],
        "MIN": [["NVV", "MIN({0}, {1})"]],
        "IFELSE": [["NVVV", "({0} ? {1} : {2})"]],
        "IF": [["NVVV", "({0} ? {1} : {2})"]],
        "CROSS": [["NSS", '({0}[i] > {1}[i] && {0}[i-1] < {1}[i-1])']],
        "CROSSUP": [["NSS", '({0}[i] > {1}[i] && {0}[i-1] < {1}[i-1])']],
        "CROSSDOWN": [["NSS", '({1}[i] > {0}[i] && {1}[i-1] < {0}[i-1])']],
        "ROUND": [["NVV", "ROUND({0}, {1})"]],
    }
    special_function_map = {
        "BACKGROUNDSTYLE": [["NV", "C.BACKGROUNDSTYLE({0});"]],
    }
    inserial_selector_map = {
        "O": "open",
        "H": "high",
        "L": "low",
        "C": "close",
        "VOL": "volume",
        "OPI": "close_oi",
        "OPEN": "open",
        "HIGH": "high",
        "LOW": "low",
        "CLOSE": "close",
        "VOLUME": "volume",
        "CLOSE_OI": "close_oi",
        # "DATE": "DATE",
        # "TIME": "TIME",
    }
    order_map = {
        # WH交易指令到本地指令映射表
        "BP": 'C.ORDER(i, "BUY", "CLOSE", {volume})',
        "BK": 'C.ORDER(i, "BUY", "OPEN", {volume})',
        "BPK": 'C.ORDER(i, "BUY", "CLOSEOPEN", {volume})',
        "SP": 'C.ORDER(i, "SELL", "CLOSE", {volume})',
        "SK": 'C.ORDER(i, "SELL", "OPEN", {volume})',
        "SPK": 'C.ORDER(i, "SELL", "CLOSEOPEN", {volume})',
    }
    color_map = {
        # WH名到本地名映射表
        "COLORRED": "RED",
        "COLORGREEN": "GREEN",
        "COLORBLUE": "BLUE",
        "COLORCYAN": "CYAN",
        "COLORBLACK": "BLACK",
        "COLORWHITE": "WHITE",
        "COLORGRAY": "GRAY",
        "COLORMAGENTA": "MAGENTA",
        "COLORYELLOW": "YELLOW",
        "COLORLIGHTGRAY": "LIGHTGRAY",
        "COLORLIGHTRED": "LIGHTRED",
        "COLORLIGHTGREEN": "LIGHTGREEN",
        "COLORLIGHTBLUE": "LIGHTBLUE",
    }
    line_style_map = {
        "CIRCLEDOT": "PS_DOT",
        "CROSSDOT": "PS_DOT",
        "DASHDOT": "PS_DASHDOT",
        "DASHDOTDOT": "PS_DASHDOTDOT",
        "POINTDOT": "PS_DOT",
    }

    IS_SERIAL = 1
    IS_VALUE = 2
    IS_SERIAL_OR_VALUE = 3

    def __init__(self, id, cname, type, params, src, **kwargs):
        self.indicator_id = id
        self.ind_option = OrderedDict()
        self.ind_option["type"] = type
        self.ind_option["cname"] = cname
        self.ind_option["state"] = "KLINE"
        self.params = params
        self.params_ids = set([p[0] for p in self.params])
        self.source_code_lines = src.split("\n")
        self.output_serials = []
        self.output_axis_list = []
        self.temp_serials = []
        self.function_serials = []
        self.serials = []
        self.body_lines = []  # 输出行
        self.scount = 0
        self.next_color = 0

    def process(self, ast, ret_style, serial_id=None):
        aid = ast[0]
        if aid == "PROG":
            params = ast[1:]
            for p in params:
                self.process(p, 'S')
            return [None, None]
        elif aid == "LINE":
            line_no = ast[1]
            self.process(ast[2], 'S')
            return [None, None]
        elif aid == "OUT_SERIAL":
            serial_id = ast[1]
            if serial_id == "_":
                serial_id = self.get_auto_serial_name()
            self.define_serial(serial_id, False)
            self.current_serial = {
                "name": serial_id,
                "color": self.get_auto_color(),
                "type": "LINE",
            }
            self.output_serials.append(self.current_serial)
            k = self.process(ast[2], 'S', serial_id)
            if self.as_serial(k) != serial_id:
                self.body_lines.append("{id}[i] = {v};".format(
                    id=serial_id,
                    v=self.as_value(k)
                ))
            return [self.IS_SERIAL, serial_id]
        elif aid == "TMP_SERIAL":
            serial_id = ast[1]
            self.define_serial(serial_id, True)
            self.current_serial = {
                "name": serial_id,
            }
            k = self.process(ast[2], 'S', serial_id)
            if self.as_serial(k) != serial_id:
                self.body_lines.append("{id}[i] = {v};".format(
                    id=serial_id,
                    v=self.as_value(k)
                ))
            return [self.IS_SERIAL, serial_id]
        elif aid == "ORDER":
            order_func = ast[1]
            order_cond = ast[2]
            order_volume = ast[3]
            order_template = self.order_map.get(order_func)
            order = order_template.format(volume=order_volume)
            self.body_lines.append("if({cond}) {order};".format(cond=self.as_value(self.process(order_cond, 'V')), order=order))
            return [self.IS_SERIAL, ""]
        elif aid == "OUT_FUNC":
            of = ast[2]
            if of == "COLORSTICK":
                self.current_serial["type"] = "RGBAR"
            elif of == "VOLUMESTICK" or of == "OPISTICK":
                self.current_serial["type"] = "PCBAR"
            else:
                self.current_serial["type"] = of
            return self.process(ast[1], ret_style, serial_id)
        elif aid == "OUT_DRAW":
            k = self.process(ast[1], 'V', "")
            self.current_draw = self.current_draw.replace("%COLOR%", "WHITE")
            self.current_draw = self.current_draw.replace("%LINEWIDTH%", "1")
            self.current_draw = self.current_draw.replace("%LINESTYLE%", "0")
            self.body_lines.append(self.current_draw)
            return [None, None]
        elif aid == "DRAW_FUNC":
            wh_func_name = ast[1]
            params = [self.as_value(self.process(v, "V")) for v in ast[2:]]
            if wh_func_name == "DRAWICON":
                self.current_draw = 'if({0})C.DRAW_ICON("ICON" + i, i, {1}, ICON_BLOCK);'.format(*params)
            elif wh_func_name == "DRAWLINE":
                self.current_draw = 'if({0} && {2})C.DRAW_SEG("LINE" + i, i, {1}, i, {3}, {4}, %LINEWIDTH%, %LINESTYLE%);'.format(*params)
            elif wh_func_name == "DRAWSL":
                # cond = params[0]
                # data = params[1]
                # slope = params[2]
                # len = params[3]
                # color = params[5]
                expand = params[4]
                if expand == "0":
                    self.current_draw = 'if({0})C.DRAW_SEG("LINE" + i, i, {1}, i+{3}, {1} + {2}, {5}, %LINEWIDTH%, %LINESTYLE%);'.format(*params)
                elif expand == "1":
                    self.current_draw = 'if({0})C.DRAW_RAY("LINE" + i, i, {1}, i-{3}, {1} + {2}, {5}, %LINEWIDTH%, %LINESTYLE%);'.format(
                        *params)
                elif expand == "2":
                    self.current_draw = 'if({0})C.DRAW_RAY("LINE" + i, i, {1}, i+{3}, {1} + {2}, {5}, %LINEWIDTH%, %LINESTYLE%);'.format(
                        *params)
                elif expand == "3":
                    self.current_draw = 'if({0})C.DRAW_LINE("LINE" + i, i, {1}, i+{3}, {1} + {2}, {5}, %LINEWIDTH%, %LINESTYLE%);'.format(
                        *params)
            elif wh_func_name == "STICKLINE":
                self.current_draw = 'if({0})C.DRAW_PANEL("BAR" + i, i, {1}, i, {2}, {3});'.format(*params)
            elif wh_func_name == "DRAWTEXT":
                if len(ast) == 6:
                    self.current_draw = 'if({0})C.DRAW_TEXT("TEXT" + i, i, {1}, {2}, {3}, %COLOR%);'.format(*params)
                else:
                    self.current_draw = 'if({0})C.DRAW_TEXT("TEXT" + i, i, {1}, {2}, %COLOR%);'.format(*params)
            return [None, None]
        elif aid == "DRAW_ALIGN":
            ret = self.process(ast[1], ret_style, serial_id)
            self.current_draw = self.current_draw.replace("%ALIGN%", ast[2])
            return ret
        elif aid == "DRAW_COLOR":
            ret = self.process(ast[1], ret_style, serial_id)
            c = self.color_map.get(ast[2], ast[2])
            self.current_draw = self.current_draw.replace("%COLOR%", c)
            return ret
        elif aid == "DRAW_FONTSIZE":
            ret = self.process(ast[1], ret_style, serial_id)
            return ret
        elif aid == "DRAW_LINEWIDTH":
            ret = self.process(ast[1], ret_style, serial_id)
            w = ast[2][-1]
            self.current_draw = self.current_draw.replace("%LINEWIDTH%", w)
            return ret
        elif aid == "SERIAL_COLOR":
            c = self.color_map.get(ast[2], ast[2])
            self.current_serial["color"] = c
            return self.process(ast[1], ret_style, serial_id)
        elif aid == "SERIAL_LINESTYLE":
            c = self.line_style_map.get(ast[2], "PS_SOLID")
            self.current_serial["style"] = c
            return self.process(ast[1], ret_style, serial_id)
        elif aid == "SERIAL_LINEWIDTH":
            c = ast[2][-1]
            self.current_serial["width"] = c
            return self.process(ast[1], ret_style, serial_id)
        elif aid == "NUMBER" or aid == "STRING":
            return [self.IS_SERIAL_OR_VALUE, ast[1]]
        elif aid == "COLOR":
            c = self.color_map.get(ast[1], ast[1])
            return [self.IS_SERIAL_OR_VALUE, c]
        elif aid == "AUTOFILTER":
            self.body_lines.append("C.TRADE_OC_CYCLE(true);")
            return [None, None]
        elif aid == "BACKGROUNDSTYLE":
            if ast[1] == "1":
                self.set_axis_option(min=0, max=100)
            elif ast[1] == "2":
                self.set_axis_option(mid=0)
        elif aid == "ID":
            id = ast[1]
            if id in self.inserial_selector_map:
                serial_id = self.inserial_selector_map.get(id)
                return [self.IS_SERIAL, "C.DS." + serial_id]
            elif id in self.serials:
                return [self.IS_SERIAL, id]
            elif id in self.params_ids:
                return [self.IS_SERIAL_OR_VALUE, id]
            elif id in self.function_map:
                wh_func_name = ast[1]
                ls = self.function_map.get(wh_func_name)
                for func_style, tq_exp in ls:
                    if len(func_style) - 1 == len(ast) - 2:
                        # 对某些特殊的函数打补丁
                        params = [self.to_prop_style(self.process(v, s), s) for s, v in zip(func_style[1:], ast[2:])]
                        if wh_func_name == "SUM" and params[1] == "0":
                            params[1] = "100"
                        # 两种情况需要定义serial: 明确要求返回serial的; 函数本身需要序列缓存的
                        if ret_style == "S" or func_style[0] == "I":
                            if not serial_id:
                                serial_id = self.get_auto_serial_name()
                                self.define_serial(serial_id, True)
                            params.append(serial_id)
                            tq = tq_exp.format(*params)
                            line = ("{serial_id}[i]={tq};").format(
                                serial_id=serial_id,
                                tq=tq,
                            )
                            self.body_lines.append(line)
                            return [self.IS_SERIAL, serial_id]
                        else:
                            exp = tq_exp.format(*params)
                            return [self.IS_VALUE, exp]
                add_error(0, 0, "函数参数数量不对, 函数名: %s, 实际参数个数: %d" % (wh_func_name, len(ast) - 2))
            add_error(0, 0, "'%s' 不是变量或函数名" % id)
        elif aid == "BINOP":
            if ast[1] == "=":
                op = "=="
            elif ast[1] == "<>":
                op = "!="
            else:
                op = ast[1]
            if ret_style == "S":
                if not serial_id:
                    serial_id = self.get_auto_serial_name()
                    self.define_serial(serial_id, True)
                self.body_lines.append("{id}[i]={p1} {op} {p2};".format(
                    id=serial_id,
                    p1=self.as_value(self.process(ast[2], "V")),
                    op=op,
                    p2=self.as_value(self.process(ast[3], "V")),
                ))
                return [self.IS_SERIAL, serial_id]
            else:
                r = "({p1} {op} {p2})".format(
                    p1=self.as_value(self.process(ast[2], "V")),
                    op=op,
                    p2=self.as_value(self.process(ast[3], "V")),
                )
                return [self.IS_VALUE, r]
        elif aid == "UMINUS":
            if ret_style == "S":
                if not serial_id:
                    serial_id = self.get_auto_serial_name()
                    self.define_serial(serial_id, True)
                self.body_lines.append("{id}[i]= 0-{p1};".format(
                    id=serial_id,
                    p1=self.as_value(self.process(ast[1], ret_style)),
                ))
                return [self.IS_SERIAL, serial_id]
            else:
                r = "(-{p1})".format(
                    p1=self.as_value(self.process(ast[1], ret_style)),
                )
                return [self.IS_VALUE, r]
        elif aid == "NULL":
            return [None, None]
        else:
            raise Exception("bad aid:" + aid)
        return [None, None]

    def to_prop_style(self, k, s):
        if s == "S":
            return self.as_serial(k)
        else:
            return self.as_value(k)

    def as_value(self, k):
        #k= (FLAG, ID)
        if k[0] == self.IS_VALUE or k[0] == self.IS_SERIAL_OR_VALUE:
            return k[1]
        else:
            return k[1]+"[i]"

    def as_serial(self, k):
        #k= (FLAG, ID)
        if k[0] == self.IS_SERIAL or k[0] == self.IS_SERIAL_OR_VALUE:
            return k[1]
        elif k[0] == self.IS_VALUE:
            serial_id = self.get_auto_serial_name()
            self.define_serial(serial_id, True)
            self.body_lines.append("{id}[i] = {v};".format(
                id=serial_id,
                v=k[1]
            ))
            return serial_id
        else:
            return k[1]

    def define_serial(self, serial_name, is_temp):
        if serial_name not in self.serials:
            self.serials.append(serial_name)
        if is_temp and serial_name not in self.temp_serials:
            self.temp_serials.append(serial_name)

    def get_auto_serial_name(self):
        self.scount += 1
        return "S_%d" % self.scount

    def get_auto_color(self):
        colors = ["RED", "GREEN", "BLUE", "CYAN", "GRAY", "MAGENTA", "YELLOW",
                  "LIGHTGRAY", "LIGHTRED", "LIGHTGREEN", "LIGHTBLUE"]
        c = colors[self.next_color]
        self.next_color = (self.next_color + 1) % len(colors)
        return c

    def output(self):
        code_result = """
function* {indicator_id}(C){{
C.DEFINE({{
{ind_options},
yaxis: [{axis_lines}],
}});
{param_lines}
{output_serial_lines}
{temp_serial_declare_lines}
while(true){{
let i = yield;
{body}
}}
}}        
            """.format(indicator_id=self.indicator_id,
                       ind_options=",\n".join("%s: %s"%(k, repr(v).replace("'", '"')) for (k,v) in self.ind_option.items()),
                       axis_lines="\n".join(str(p) for p in self.output_axis_list),
                       param_lines="\n".join(
                           ['let %s = C.PARAM(%f, "%s", {"MIN": %f, "MAX":%f});' % (p[0], p[3], p[0], p[1], p[2]) for p
                            in self.params]),
                       output_serial_lines="\n".join([self.format_output_serial(p) for p in self.output_serials]),
                       temp_serial_declare_lines="\n".join(['let %s = [];' % (p) for p in self.temp_serials]),
                       body="\n".join(self.body_lines))
        return [code_result, get_errors()]

    def set_ind_option(self, k, v):
        self.ind_option[k] = v

    def set_axis_option(self, **kwargs):
        id = len(self.output_axis_list)
        kwargs["id"] = id
        self.output_axis_list.append(kwargs)

    def format_output_serial(self, out_serial):
        type = out_serial["type"]
        name = out_serial["name"]
        out_serial.pop("type")
        out_serial.pop("name")
        params = out_serial.copy()
        s = 'let {name} = C.OUTS("{type}", "{name}", {{{params}}});'.format(
            type=type,
            name=name,
            params=", ".join("%s: %s"%(k,v) for (k,v) in params.items())
        )
        return s


def wenhua_translate(req):
    """
    req:{
        id: "macd', //指标函数名
        cname: "macd中文名", //指标中文名称
        type: "MAIN", //指标类型, MAIN=主图指标, SUB=副图指标
        params: [
            ("SHORT", 3, 1, 100), //参数表，参数名/默认值/最小值/最大值
            ("LONG", 5, 2, 200),
        ],
        src: "...", //文华原代码
    }
    ret: {
        errline: 10,   //当转换过程出错时，标记出错行号，无错时为0, 在文件尾部出错为-1
        errcol: 3, //当转换过程出错时，标记出错列号，无错时为0, 在文件尾部出错为-1
        errvalue: "sum", //当转换过程出错时，标记出错字符，无错时为""
        target: "...", //转换好的目标代码
    }
    """
    #解析并拼装
    clear_error()
    n = WhProgram(**req)
    try:
        x = wh.whparser.parse(req["src"])
        n.process(x, 'S')
    except TypeError as e:
        pass
    return n.output()


#---------------------------------------------------------------------------------
if __name__ == "__main__":
    pass
