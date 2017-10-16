#!/usr/bin/env python
#coding=utf-8

import logging
import json
import ply.lex as lex
import ply.yacc as yacc


logger = logging.getLogger()


class TranslateException(Exception):
    def __init__(self, err_line, err_col, err_msg):
        self.err_line = err_line
        self.err_col = err_col
        self.err_msg = err_msg
    def __str__(self):
        return "line:%d, col:%d, msg:%s" % (self.err_line, self.err_col, self.err_msg)


#转换支持环境

def reset():
    global input_serials, input_params, serials, output_serials, body_lines, function_serials, scount, current_line, temp_serials, line_start_map, current_output_serial
    input_serials = []  # 所有输入序列
    output_serials = []
    temp_serials = []
    function_serials = []
    serials = []
    input_params = [] # 所有参数
    body_lines = [] # 输出行
    scount = 0
    current_line = []
    line_start_map = {} #行号->行第一个字符pos的映射表
    current_output_serial = {
        "color": get_auto_color(),
        "type": "LINE"
    }

next_color = 0
def get_auto_color():
    global next_color
    colors = ["RED", "GREEN", "BLUE", "CYAN", "GRAY", "MAGENTA", "YELLOW", "LIGHTGRAY", "LIGHTRED", "LIGHTGREEN", "LIGHTBLUE"]
    c = colors[next_color]
    next_color = (next_color + 1) % len(colors)
    return c

def auto_serial_name():
    global scount
    scount += 1
    return "S_%d" % scount

def is_param(n):
    return n in input_params

def is_serial(n):
    return n in serials

def define_serial(serial_name, is_temp):
    if serial_name not in serials:
        serials.append(serial_name)
    if is_temp and serial_name not in temp_serials:
        temp_serials.append(serial_name)

def define_param(param_name):
    if param_name not in input_params:
        input_params.append(param_name)

def define_input_serial(serial_name):
    define_serial(serial_name, False)
    if serial_name not in input_serials:
        input_serials.append(serial_name)

def define_output(serial_name):
    define_serial(serial_name, False)
    global current_output_serial
    current_output_serial["name"] = serial_name
    output_serials.append(current_output_serial)
    current_output_serial = {
        "color": get_auto_color(),
        "type":"LINE"
    }

def set_output_color(color):
    global current_output_serial
    c = color_map.get(color, color)
    current_output_serial["color"] = c

def set_output_type(t):
    global current_output_serial
    current_output_serial["type"] = t

def define_function_serial(fname, fparam):
    nname = function_map.get(fname, fname)
    for i in range(0, len(function_serials)):
        if function_serials[i]["name"] == nname and function_serials[i]["param"] == fparam:
            return function_serials[i]["id"]
    id = auto_serial_name()
    s = {
        "id": id,
        "name": nname,
        "param": fparam,
    }
    function_serials.append(s)
    current_line.append("{id}[i]={name}(i, {param}, {id});".format(**s))
    define_serial(id, True)
    return s["id"]

def define_compare_serial(compare_expr):
    id = auto_serial_name()
    define_serial(id, True)
    current_line.append("{id}[i]=({compare_expr});".format(id=id, compare_expr=compare_expr))
    return id

def as_value(s):
    return s+"[i]";

def finish_line(last):
    global body_lines, current_line
    body_lines += current_line
    body_lines.append(last)
    current_line = []


#lex+yacc语法规范
tokens = [
    "ID", 'NUMBER', "COMMENT",
    "VVALUE", "VSERIAL",
    'PLUS', 'MINUS', 'TIMES', 'DIVIDE', 'EQUALS',
    'LPAREN','RPAREN',
    'COMMA', "SEMICOLON", "COLON", "COLON_EQUALS",
    "LT", "LTE", "GT", "GTE",
    "AND", "OR", "NOT",
    "SERIAL",
    "FUNCS", #函数，1个序列参数
    "FUNCSS", #函数，2个序列参数
    "FUNCSV", #函数，1个序列参数,一个数值参数
    "FUNCSVV",
    "FUNCVV",
    "FUNCV",
    "COLOR",
    "OFUNC",
    "IFELSE",
    "COUNT",
    "BACKGROUNDSTYLE",
    # 0 是保持本身坐标不变。
    # 1 是将坐标固定在0到100之间。
    # 2 是将坐标以0为中轴的坐标系。
]


reserved = {
    # 输入序列
    "OPEN": "SERIAL",
    "HIGH": "SERIAL",
    "LOW": "SERIAL",
    "CLOSE": "SERIAL",
    "VOL": "SERIAL",
    "O": "SERIAL",
    "H": "SERIAL",
    "L": "SERIAL",
    "C": "SERIAL",
    # 序列函数
    "ABS": "FUNCV",
    "REF": "FUNCSV",
    "MA": "FUNCSV",
    "STD": "FUNCSV",
    "EMA": "FUNCSV",
    "DMA": "FUNCSV",
    "HHV": "FUNCSV",
    "LLV": "FUNCSV",
    "SUM": "FUNCSV",
    "SMA": "FUNCSVV",
    "MAX": "FUNCVV",
    "MIN": "FUNCVV",
    # 颜色
    "COLORRED": "COLOR",
    "COLORGREEN": "COLOR",
    "COLORBLUE": "COLOR",
    "COLORCYAN": "COLOR",
    "COLORBLACK": "COLOR",
    "COLORWHITE": "COLOR",
    "COLORGRAY": "COLOR",
    "COLORMAGENTA": "COLOR",
    "COLORYELLOW": "COLOR",
    "COLORLIGHTGRAY": "COLOR",
    "COLORLIGHTRED": "COLOR",
    "COLORLIGHTGREEN": "COLOR",
    "COLORLIGHTBLUE": "COLOR",
    # 输出函数
    "COLORSTICK": "OFUNC",
    # 特殊函数
    "IFELSE": "IFELSE",
    "COUNT": "COUNT",
    "BACKGROUNDSTYLE": "BACKGROUNDSTYLE",
}

function_map = {
    #文华函数到本地函数名映射表
    "HHV": "HIGHEST",
    "LLV": "LOWEST",
    "STD": "STDEV",
}

inserial_selector_map = {
    "O": "OPEN",
    "H": "HIGH",
    "L": "LOW",
    "C": "CLOSE",
    "VOL": "VOLUME",
}

color_map = {
    #文华函数到本地函数名映射表
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


# Tokens
def t_ID(t):
    r'[a-zA-Z_][a-zA-Z_0-9]*'
    t.type = reserved.get(t.value, None)    # Check for reserved words
    if t.type:
        return t
    if is_param(t.value):
        t.type = "VVALUE"
    elif is_serial(t.value):
        t.type = "VSERIAL"
    else:
        t.type = "ID"
    return t

t_COLON_EQUALS = r':='
t_PLUS    = r'\+'
t_MINUS   = r'-'
t_TIMES   = r'\*'
t_DIVIDE  = r'/'
t_EQUALS  = r'='
t_COMMA  = r','
t_SEMICOLON  = r';'
t_COLON  = r':'
t_LPAREN  = r'\('
t_RPAREN  = r'\)'
t_LT = r'<'
t_LTE = r'<='
t_GT = r'>'
t_GTE = r'>='
t_AND = r'&&'
t_OR = r'\|\|'
t_NUMBER = r'[\d\.]+'
t_ignore = " \t"

def t_COMMENT(t):
    r'//.*'
    pass

def t_newline(t):
    r'\n+'
    n = t.value.count("\n")
    t.lexer.lineno += n
    global line_start_map
    line_start_map[t.lexer.lineno] = t.lexer.lexpos 

def t_error(t):
    logger.warning("Illegal character '%s'" % t.value[0])
    t.lexer.skip(1)

precedence = (
    ('left', 'COLON'),
    ('left', 'PLUS', 'MINUS'),
    ('left', 'TIMES', 'DIVIDE'),
    )

def p_lines_line(p):
    """
    lines : line
    """
    logger.debug("p_lines_line: %s", p[1])
    p[0] = p[1]

def p_lines_lines_line(p):
    """
    lines : lines line
    """
    logger.debug("p_lines_lines_line: %s, %s", p[1], p[2])
    p[0] = p[1] + "\n" + p[2]

def p_line_statement(p):
    """
    line : statement SEMICOLON
    """
    logger.debug("p_line_statement: %s", p[1])
    p[0] = p[1] + ";"
    finish_line(p[0])

def p_statement_output_serial_define(p):
    """
    statement : ID COLON expressions
    """
    logger.debug("p_line_output_serial_define: %s, %s", p[1], p[3])
    define_output(p[1])
    p[0] = '%s[i] = %s' % (p[1], as_value(p[3]))

def p_statement_anoymouse_output(p):
    """
    statement : expressions
    """
    logger.debug("p_statement_anoymouse_output: %s", p[1])
    name = auto_serial_name()
    define_output(name)
    p[0] = "%s[i] = %s" % (name, as_value(p[1]))

def p_statement_temp_serial_define(p):
    """
    statement : ID COLON_EQUALS expressions
    """
    logger.debug("p_line_temp_serial_define: %s, %s", p[1], p[3])
    define_serial(p[1], True)
    p[0] = '%s[i] = %s' % (p[1], as_value(p[3]))

def p_statement_with_ofunc(p):
    """
    statement : statement COMMA OFUNC
    """
    logger.debug("p_statement_with_ofunc: %s, %s", p[1], p[3])
    set_output_type(p[3])
    p[0] = p[1]

def p_statement_with_color(p):
    """
    statement : statement COMMA COLOR
    """
    logger.debug("p_statement_with_color: %s, %s", p[1], p[3])
    set_output_color(p[1])
    p[0] = p[1]

def p_line_background_style(p):
    """
    line : BACKGROUNDSTYLE LPAREN NUMBER RPAREN SEMICOLON
    """
    logger.debug("p_line_background_style: %s", p[3])
    #@todo
    p[0] = ""

def p_expression_expressionv(p):
    '''expression : expressionv'''
    logger.debug("p_expression_expressionv: %s", p[1])
    p[0] = p[1]

def p_expression_expressions(p):
    '''expression : expressions'''
    logger.debug("p_expression_expressions: %s", p[1])
    p[0] = p[1]

def p_param_expression(p):
    '''param : expression'''
    logger.debug("p_param_expression: %s", p[1])
    p[0] = p[1]

def p_params_param(p):
    '''params : param'''
    logger.debug("p_params_param: %s", p[1])
    p[0] = p[1]

def p_params_params_param(p):
    '''params : params COMMA param'''
    logger.debug("p_params_params_param: %s, %s", p[1], p[3])
    p[0] = p[1] + ", " + p[3]

def p_expressionv_paren(t):
    '''expressionv : LPAREN expressionv RPAREN'''
    logger.debug("p_expressionv_paren: %s", t[2])
    t[0] = "(%s)" % t[2]

def p_expressions_paren(t):
    '''expressions : LPAREN expressions RPAREN'''
    logger.debug("p_expressions_paren: %s", t[2])
    t[0] = "(%s)" % t[2]

def p_expressionv_expressions(t):
    '''expressionv : expressions'''
    logger.debug("p_expressionv_expressions: %s", t[1])
    t[0] = "%s[i]" % (t[1])

def p_expressionv_binop(t):
    '''expressions : expressionv PLUS expressionv
                  | expressionv MINUS expressionv
                  | expressionv TIMES expressionv
                  | expressionv DIVIDE expressionv'''
    logger.debug("p_expressionv_binop: %s", t[1], t[2], t[3])
    id = auto_serial_name()
    define_serial(id, True)
    expr = "(%s %s %s)" % (t[1], t[2], t[3])
    current_line.append("{id}[i]=({expr});".format(id=id, expr=expr))
    t[0] = id
    # t[0] = "(%s %s %s)" % (t[1], t[2], t[3])


def p_expressionv_number(p):
    """expressionv : NUMBER"""
    logger.debug("p_expressionv_number: %s", p[1])
    p[0] = p[1]

def p_expressions_serial(p):
    """expressions : SERIAL
    """
    logger.debug("p_expressions_serial: %s", p[1])
    s = inserial_selector_map.get(p[1], p[1])
    define_input_serial(s)
    p[0] = s

def p_expressionv_vvalue(p):
    """expressionv : VVALUE
    """
    logger.debug("p_expressionv_id: %s", p[1])
    if is_param(p[1]):
        p[0] = p[1]
    elif is_serial(p[1]):
        p[0] = as_value(p[1])
    else:
        global line_start_map
        raise TranslateException(err_line=p.slice[1].lineno,
                                 err_col=p.slice[1].lexpos - line_start_map.get(p.slice[1].lineno, 0) + 1,
                                 err_msg="无法识别的标识符: %s. 如果这是一个指标参数,请将它加入参数表中" % p[1])

def p_expressionv_id(p):
    """expressionv : ID
    """
    logger.debug("p_expressionv_id: %s", p[1])
    global line_start_map
    raise TranslateException(err_line=p.slice[1].lineno,
                             err_col=p.slice[1].lexpos - line_start_map.get(p.slice[1].lineno, 0) + 1,
                             err_msg="无法识别的标识符: %s. 如果这是一个指标参数,请将它加入参数表中" % p[1])

def p_expressions_function(p):
    'expressions : function'
    logger.debug("p_expressions_function: %s", p[1])
    p[0] = p[1]

def p_expressions_vserial(p):
    """expressions : VSERIAL
    """
    logger.debug("p_expressions_id: %s", p[1])
    if is_serial(p[1]):
        p[0] = p[1]
    else:
        global line_start_map
        raise TranslateException(err_line=p.slice[1].lineno,
                                 err_col=p.slice[1].lexpos - line_start_map.get(p.slice[1].lineno, 0) + 1,
                                 err_msg="无法识别的标识符: %s. 请检查拼写是否有误" % p[1])

def p_function_ifelse(p):
    """ function : IFELSE LPAREN compare_expression COMMA expressionv COMMA expressionv RPAREN"""
    logger.debug("p_function_ifelse: %s, %s, %s", p[3], p[5], p[7])
    id = auto_serial_name()
    define_serial(id, True)
    current_line.append("{id}[i]=IFELSE({cond}, {vtrue}, {vfalse});".format(id=id, cond=p[3], vtrue=p[5], vfalse=p[7]))
    p[0] = id

def p_function_count(p):
    """ function : COUNT LPAREN compare_expression COMMA expressionv RPAREN"""
    logger.debug("p_function_count: %s, %s", p[3], p[5])
    s_name = define_function_serial("COUNT", "%s,%s" % (p[3], p[5]))
    p[0] = "%s" % s_name

def p_function_s(p):
    """ function : FUNCS LPAREN expressions RPAREN"""
    logger.debug("p_function_s: %s, %s", p[1], p[3])
    fname = function_map.get(p[1], p[1])
    s_name = define_function_serial(fname, "%s" % (p[3]))
    p[0] = "%s" % s_name

def p_function_sv(p):
    """ function : FUNCSV LPAREN expressions COMMA expressionv RPAREN"""
    logger.debug("p_function_sv: %s, %s, %s", p[1], p[3], p[5])
    fname = function_map.get(p[1], p[1])
    s_name = define_function_serial(fname, "%s,%s" % (p[3], p[5]))
    p[0] = "%s" % s_name

def p_function_ss(p):
    """ function : FUNCSS LPAREN expressions COMMA expressions RPAREN"""
    logger.debug("p_function_ss: %s, %s, %s", p[1], p[3], p[5])
    fname = function_map.get(p[1], p[1])
    s_name = define_function_serial(fname, "%s,%s" % (p[3], p[5]))
    p[0] = "%s" % s_name

def p_function_vv(p):
    """ function : FUNCVV LPAREN expressionv COMMA expressionv RPAREN"""
    logger.debug("p_function_vv: %s, %s, %s", p[1], p[3], p[5])
    fname = function_map.get(p[1], p[1])
    id = auto_serial_name()
    define_serial(id, True)
    current_line.append("{id}[i]={name}({param});".format(id=id, name=fname, param="%s,%s" % (p[3], p[5])))
    p[0] = id

def p_function_v(p):
    """ function : FUNCV LPAREN expressionv RPAREN"""
    logger.debug("p_function_vv: %s, %s, %s", p[1], p[3])
    fname = function_map.get(p[1], p[1])
    id = auto_serial_name()
    define_serial(id, True)
    current_line.append("{id}[i]={name}({param});".format(id=id, name=fname, param=p[3]))
    p[0] = id

def p_function_svv(p):
    """ function : FUNCSVV LPAREN expressions COMMA expressionv COMMA expressionv RPAREN"""
    logger.debug("p_function_svv: %s, %s, %s", p[1], p[3], p[5], p[7])
    fname = function_map.get(p[1], p[1])
    s_name = define_function_serial(fname, "%s,%s,%s" % (p[3], p[5], p[7]))
    p[0] = "%s" % s_name

def p_function_unknown(p):
    """ function : ID LPAREN params RPAREN"""
    raise TranslateException(err_line=p.slice[1].lineno,
                             err_col=p.slice[1].lexpos - line_start_map.get(p.slice[1].lineno, 0) + 1,
                             err_msg="尚未支持此函数: %s." % p[1])

def p_compare_expression(p):
    """compare_expression : expressionv LT expressionv
                          | expressionv LTE expressionv
                          | expressionv GT expressionv
                          | expressionv GTE expressionv
                          | expressionv EQUALS expressionv
    """
    logger.debug("p_compare_expression: %s, %s, %s", p[1], p[2], p[3])
    ce = "%s %s %s" %(p[1], p[2], p[3])
    s_name = define_compare_serial(ce)
    p[0] = "%s[i]" % s_name

def p_compare_expression_expression(p):
    """compare_expression : compare_expression AND compare_expression
                          | compare_expression OR compare_expression
    """
    logger.debug("p_compare_expression_expression: %s, %s, %s", p[1], p[2], p[3])
    ce = "%s %s %s" %(p[1], p[2], p[3])
    s_name = define_compare_serial(ce)
    p[0] = "%s[i]" % s_name

def p_error(p):
    if p:
        raise TranslateException(err_line=p.lineno,
                                 err_col=p.lexpos - line_start_map.get(p.lineno, 0) + 1,
                                 err_msg="不应该出现在这里的字符 %s" % p.value)
    else:
        raise TranslateException(err_line=-1,
                                 err_col=-1,
                                 err_msg="代码未正确结束,请检查括号匹配和行末分号等")

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
    # Build the lexer
    lexer = lex.lex()

    reset()
    global input_params
    #检查请求信息
    indicator_id = req["id"]
    wenhua_src = req["src"]
    input_params = [p[0] for p in req["params"]]
    #解析并拼装
    parser = yacc.yacc(debug=True, debuglog=logger)
    parser.parse(wenhua_src)
    target = """
function* {indicator_id}(C){{
C.DEFINE({{
type: "{type}",
cname: "{cname}",
state: "KLINE",
}});
//定义指标参数
{param_lines}
//输入序列
{input_serial_lines}
//输出序列
{output_serial_lines}
//临时序列
{temp_serial_declare_lines}
//指标计算
while(true){{
let i = yield;
{body}
}}
}}        
    """.format(indicator_id=indicator_id,
               type=req["type"],
               cname=req["cname"],
               param_lines="\n".join(['let %s = C.PARAM(%f, "%s", {"MIN": %f, "MAX":%f});' % (p[0], p[3], p[0], p[1], p[2]) for p in req["params"]]),
               input_serial_lines="\n".join(['let %s = C.SERIAL("%s");' % (p, p) for p in input_serials]),
               output_serial_lines="\n".join(['let {name} = C.OUTS("{type}", "{name}", {{color: {color}}});'.format(**p) for p in
                                    output_serials]),
               temp_serial_declare_lines="\n".join(['let %s = [];' % (p) for p in temp_serials]),
               body="\n".join(body_lines))
    return target


#---------------------------------------------------------------------------------


# MID := (HIGH+LOW+CLOSE)/3;//求最新价，最高价和最低价三者的简单平均
# CR:SUM(MAX(0,HIGH-REF(MID,1)),N)/SUM(MAX(0,REF(MID,1)-LOW),N)*100;//取最高价减去一个周期前的MID的与0中的最大值，求和，取一个周期前的MID减去最低价与0中的最大值，求和，两个和的百分比
# CRMA1:REF(MA(CR,M1),M1/2.5+1);//取(M1/2.5+1)个周期前的M1周期CR简单平均值

# TR : MAX((HIGH-LOW),(CLOSE-OPEN));
# TR : MAX((HIGH-LOW),ABS(REF(CLOSE,1)-HIGH));
# TR : MAX(MAX((HIGH-LOW),ABS(REF(CLOSE,1)-HIGH)),ABS(REF(CLOSE,1)-LOW));//求最高价减去最低价，一个周期前的收盘价减去最高价的绝对值，一个周期前的收盘价减去最低价的绝对值，这三个值中的最大值
# ATR : MA(TR,N),COLORYELLOW;//求N个周期内的TR的简单移动平均

# {"id":"macdw","cname":"macdw","type":"SUB","params":[["N1",10,1,100]],"src":"MA1:ddd(CLOSE,N1);"}



if __name__ == "__main__":
    def tryconvert(f):
        ret = wenhua_translate(f)
        print ("""
        -INPUT--------------------------------
        %s
        -OUTPUT--------------------------------
        %s
        -EXPECTED--------------------------------
        """ % (f["src"], ret))

    from cases.psy import case
    tryconvert(case)
