#!/usr/bin/env python
#coding=utf-8

import logging
import json

logging.basicConfig(
    level=logging.DEBUG,
    # filename = "parselog.txt",
    # filemode = "w",
    format="%(filename)10s:%(lineno)4d:%(message)s"
)
log = logging.getLogger()


#转换支持环境
input_serials = []
input_params = []
serials = []
output_serials = []
body_lines = []
function_serials = []
scount = 1
current_line = []
convert_result = {
    "errline": -1,
    "errcol": -1,
    "errvalue": "",
    "target": "",
}

def get_auto_color():
    return "RED"

def is_param(n):
    return n in input_params

def is_serial(n):
    return n in input_serials or n in serials

def define_param(param_name):
    if param_name not in input_params:
        input_params.append(param_name)

def define_input_serial(serial_name):
    if serial_name not in input_serials:
        input_serials.append(serial_name)

def define_serial(serial_name):
    if serial_name not in serials:
        serials.append(serial_name)

def define_output(serial_name, serial_type, serial_color):
    define_serial(serial_name)
    if serial_type=="COLORSTICK":
        serial_type="BAR"
    output_serials.append({
        "name": serial_name,
        "type": serial_type,
        "color": serial_color})

def define_function_serial(fname, fparam):
    nname = function_map.get(fname, fname)
    for i in range(0, len(function_serials)):
        if function_serials[i]["name"] == nname and function_serials[i]["param"] == fparam:
            return function_serials[i]["id"]
    s = {
        "id": "_f%d" % len(function_serials),
        "name": nname,
        "param": fparam,
    }
    function_serials.append(s)
    current_line.append("{id}[i]={name}(i, {param}, {id});".format(**s))
    return s["id"]

def auto_serial_name():
    global scount
    scount += 1
    return "S_%d" % scount

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
    'PLUS', 'MINUS', 'TIMES', 'DIVIDE', 'EQUALS',
    'LPAREN','RPAREN',
    'COMMA', "SEMICOLON", "COLON", "COLON_EQUALS",
    "LT", "LTE", "GT", "GTE",
    "SERIAL",
    "FUNCVVV", #函数，返回值
    "FUNCSSV", #函数，返回值是一个序列，有两参数，分别是serial和value
    "FUNCSSVV",
    "OFUNC",
    "IFELSE",
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
    "REF": "FUNCSSV",
    "MA": "FUNCSSV",
    "EMA": "FUNCSSV",
    "DMA": "FUNCSSV",
    "HHV": "FUNCSSV",
    "LLV": "FUNCSSV",
    "SUM": "FUNCSSV",
    "SMA": "FUNCSSVV",
    "MAX": "FUNCVVV",
    "MIN": "FUNCVVV",
    # 输出函数
    "COLORSTICK": "OFUNC",
    # 特殊函数
    "IFELSE": "IFELSE",
    "BACKGROUNDSTYLE": "BACKGROUNDSTYLE",
}

function_map = {
    #文华函数到本地函数名映射表
    "HHV": "HIGHEST",
    "LLV": "LOWEST",
}

# Tokens
def t_ID(t):
    r'[a-zA-Z_][a-zA-Z_0-9]*'
    t.type = reserved.get(t.value, 'ID')    # Check for reserved words
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
t_NUMBER = r'[\d\.]+'
t_ignore = " \t"

def t_COMMENT(t):
    r'//.*'
    pass

def t_newline(t):
    r'\n+'
    t.lexer.lineno += t.value.count("\n")
    t.lexer.colstart = t.lexer.lexpos

def t_error(t):
    print("Illegal character '%s'" % t.value[0])
    t.lexer.skip(1)

# Build the lexer
import ply.lex as lex
lexer = lex.lex()

precedence = (
    ('left', 'COLON'),
    ('left', 'PLUS', 'MINUS'),
    ('left', 'TIMES', 'DIVIDE'),
    )

def p_lines_line(p):
    """
    lines : line
    """
    print("p_lines_line", p[1])
    p[0] = p[1]

def p_lines_lines_line(p):
    """
    lines : lines line
    """
    print("p_lines_lines_line", p[1], p[2])
    p[0] = p[1] + "\n" + p[2]

def p_line_output_serial_define(p):
    """
    line : ID COLON expressionv SEMICOLON
    """
    print("p_line_output_serial_define", p[1], p[3])
    define_output(p[1], "LINE", get_auto_color())
    p[0] = '%s[i] = %s;' % (p[1], p[3])
    finish_line(p[0])

def p_line_output_serial_define_with_func(p):
    """
    line : ID COLON expressionv COMMA OFUNC SEMICOLON
    """
    print("p_line_output_serial_define_with_func", p[1], p[3], p[5])
    define_output(p[1], p[5], get_auto_color())
    p[0] = '%s[i] = %s;' % (p[1], p[3])
    finish_line(p[0])

def p_line_anoymouse_output_with_func(p):
    """
    line : expressionv COMMA OFUNC SEMICOLON
    """
    print("p_line_anoymouse_output_with_func", p[1], p[3])
    name = auto_serial_name()
    define_output(name, p[3], get_auto_color())
    p[0] = "%s[i] = %s" % (name, p[1])
    finish_line(p[0])

def p_line_temp_serial_define(p):
    """
    line : ID COLON_EQUALS expressionv SEMICOLON
    """
    print("p_line_temp_serial_define", p[1], p[3])
    define_serial(p[1])
    p[0] = '%s[i] = %s;' % (p[1], p[3])
    finish_line(p[0])

def p_line_background_style(p):
    """
    line : BACKGROUNDSTYLE LPAREN NUMBER RPAREN SEMICOLON
    """
    print("p_line_background_style", p[3])
    #@todo
    p[0] = ""

def p_expressionv_paren(t):
    '''expressionv : LPAREN expressionv RPAREN'''
    print("p_expressionv_paren", t[2])
    t[0] = "(%s)" % t[2]

def p_expressionv_binop(t):
    '''expressionv : expressionv PLUS expressionv
                  | expressionv MINUS expressionv
                  | expressionv TIMES expressionv
                  | expressionv DIVIDE expressionv'''
    print("p_expressionv_binop", t[1], t[2], t[3])
    t[0] = "(%s %s %s)" % (t[1], t[2], t[3])

def p_expressionv_number(p):
    """expressionv : NUMBER"""
    print("p_expressionv_number", p[1])
    p[0] = p[1]

def p_expressionv_serial(p):
    """expressionv : SERIAL"""
    if p[1] == "O":
        p[0] = "OPEN"
    elif p[1] == "H":
        p[0] = "HIGH"
    elif p[1] == "L":
        p[0] = "LOW"
    elif p[1] == "C":
        p[0] = "CLOSE"
    else:
        p[0] = p[1]
    define_input_serial(p[0])
    p[0] = as_value(p[0])

def p_expressions_serial(p):
    """expressions : SERIAL
    """
    if p[1] == "O":
        p[0] = "OPEN"
    elif p[1] == "H":
        p[0] = "HIGH"
    elif p[1] == "L":
        p[0] = "LOW"
    elif p[1] == "C":
        p[0] = "CLOSE"
    else:
        p[0] = p[1]
    define_input_serial(p[0])

def p_expressionv_id(p):
    """expressionv : ID
    """
    print("p_expressionv_id", p[1])
    if is_param(p[1]):
        p[0] = p[1]
    elif is_serial(p[1]):
        p[0] = as_value(p[1])
    else:
        p[0] = ""
        # raise Exception("unknown id:"+p[1])

def p_expressionv_function(p):
    'expressionv : function'
    print("p_expressionv_function", p[1])
    p[0] = p[1]

def p_expressions_id(p):
    """expressions : ID
    """
    print("p_expressions_id", p[1])
    p[0] = p[1]

def p_function_ifelse(p):
    """ function : IFELSE LPAREN compare_expression COMMA expressionv COMMA expressionv RPAREN"""
    print("p_function_ifelse", p[3], p[5], p[7])
    p[0] = "(%s) ? (%s) : (%s)" % (p[3], p[5], p[7])

def p_function_s_sv(p):
    """ function : FUNCSSV LPAREN expressions COMMA expressionv RPAREN"""
    print("p_function_s_sv", p[1], p[3], p[5])
    fname = function_map.get(p[1], p[1])
    s_name = define_function_serial(fname, "%s,%s" % (p[3], p[5]))
    p[0] = "%s[i]" % s_name

def p_function_s_svv(p):
    """ function : FUNCSSVV LPAREN expressions COMMA expressionv COMMA expressionv RPAREN"""
    print("p_function_s_svv", p[1], p[3], p[5], p[7])
    fname = function_map.get(p[1], p[1])
    s_name = define_function_serial(fname, "%s,%s,%s" % (p[3], p[5], p[7]))
    p[0] = "%s[i]" % s_name

def p_function_v_vv(p):
    """ function : FUNCVVV LPAREN expressionv COMMA expressionv RPAREN"""
    print("p_function_v_vv", p[1], p[3], p[5])
    fname = function_map.get(p[1], p[1])
    p[0] = "%s(%s,%s)" % (fname, p[3], p[5])

def p_compare_expression(p):
    """compare_expression : expressionv LT expressionv
                          | expressionv LTE expressionv
                          | expressionv GT expressionv
                          | expressionv GTE expressionv
                          | expressionv EQUALS expressionv
    """
    print("p_compare_expression", p[1], p[2], p[3])
    p[0] = "(%s %s %s)" % (p[1], p[2], p[3])

def p_error(p):
    global convert_result
    convert_result["errline"] = p.lineno
    convert_result["errcol"] = p.lexpos - p.lexer.colstart + 1
    convert_result["errvalue"] = p.value
    if p:
        print("Syntax error at token", p.type)
    else:
        print("Syntax error at EOF")


import ply.yacc as yacc

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
        errline: 10,   //当转换过程出错时，标记出错行号，无错时为-1
        errcol: 3, //当转换过程出错时，标记出错列号，无错时为-1
        errvalue: "sum", //当转换过程出错时，标记出错字符，无错时为""
        target: "...", //转换好的目标代码
    }
    """
    global input_params
    global convert_result
    #检查请求信息
    indicator_id = req["id"]
    wenhua_src = req["src"]
    input_params = [p[0] for p in req["params"]]
    #解析并拼装
    parser = yacc.yacc(debug=True, debuglog=log)
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
{function_serial_declare_lines}
    //指标计算
    while(true){{
        let i = yield;
{body}
    }}
}}        
    """.format(indicator_id=indicator_id,
               type=req["type"],
               cname=req["cname"],
               param_lines="\n".join(['    let %s = C.PARAM(%f, "%s", {"MIN": %f, "MAX":%f});' % (p[0], p[3], p[0], p[1], p[2]) for p in req["params"]]),
               input_serial_lines="\n".join(['    let %s = C.SERIAL("%s");' % (p, p) for p in input_serials]),
               output_serial_lines="\n".join(['    let {name} = C.OUTS("{type}", "{name}", {{color: {color}}});'.format(**p) for p in
                                    output_serials]),
               function_serial_declare_lines="\n".join(['    let {id} = [];'.format(**p) for p in function_serials]),
               body="\n".join(body_lines))
    convert_result["target"] = target
    return convert_result

#---------------------------------------------------------------------------------

ma2 = {
    "id": "ma2",
    "cname": "ma2",
    "type": "MAIN",
    "src": """
//#移动平均线组合
//@N1:0,200,5
//@N2:0,200,10
//@N3:0,200,20
//@N4:0,200,40
//@N5:0,200,60
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
MA1:MA(CLOSE,N1);
MA2:MA(CLOSE,N2);
MA3:MA(CLOSE,N3);
MA4:MA(CLOSE,N4);
MA5:MA(CLOSE,N5);
MA6:MA(CLOSE,N6);//定义6条均线    
    """,
    "params": [
        ("N1", 1, 100, 20),
        ("N2", 1, 100, 20),
        ("N3", 1, 100, 20),
        ("N4", 1, 100, 20),
        ("N5", 1, 100, 20),
        ("N6", 1, 100, 20),
    ],
    "expected": """
function* ma(C){
    C.DEFINE({
        type: "MAIN",
        cname: "均线组",
        state: "KLINE",
    });
    let n1 = C.PARAM(3, "N1");
    let n2 = C.PARAM(5, "N2");
    let n3 = C.PARAM(10, "N3");
    let n4 = C.PARAM(20, "N4");
    let n5 = C.PARAM(50, "N5");
    let n6 = C.PARAM(100, "N6");
    let s = C.SERIAL("CLOSE");

    let s1 = C.OUTS("LINE", "ma" + n1, {color: RED});
    let s2 = C.OUTS("LINE", "ma" + n2, {color: GREEN});
    let s3 = C.OUTS("LINE", "ma" + n3, {color: BLUE});
    let s4 = C.OUTS("LINE", "ma" + n4, {color: RED});
    let s5 = C.OUTS("LINE", "ma" + n5, {color: GREEN});
    let s6 = C.OUTS("LINE", "ma" + n6, {color: BLUE});
    while(true) {
        let i = yield;
        s1[i] = MA(i, s, n1, s1);
        s2[i] = MA(i, s, n2, s2);
        s3[i] = MA(i, s, n3, s3);
        s4[i] = MA(i, s, n4, s4);
        s5[i] = MA(i, s, n5, s5);
        s6[i] = MA(i, s, n6, s6);
    }
}
    """,
}

macd2 = {
    "id": "macd2",
    "cname": "MACD2",
    "type": "SUB",
    "src": """
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
DIFF : EMA(CLOSE,SHORT) - EMA(CLOSE,LONG);//短周期与长周期的收盘价的指数平滑移动平均值做差。
DEA  : EMA(DIFF,M);//DIFF的M个周期指数平滑移动平均
2*(DIFF-DEA),COLORSTICK;//DIFF减DEA的2倍画柱状线
    """,
    "params": [
        ("SHORT", 1, 100, 20),
        ("LONG", 1, 100, 20),
        ("M", 1, 100, 20),
    ],
    "expected": """
function* macd(C) {
    // DIFF : EMA(CLOSE,SHORT) - EMA(CLOSE,LONG);//短周期与长周期的收盘价的指数平滑移动平均值做差。
    // DEA  : EMA(DIFF,M);//DIFF的M个周期指数平滑移动平均
    // 2*(DIFF-DEA),COLORSTICK;//DIFF减DEA的2倍画柱状线
    C.DEFINE({
        type: "SUB",
        cname: "MACD",
        state: "KLINE",
        yaxis: [
            {id: 0, mid: 0, format: "NUMBER2"},
        ]
    });
    //参数
    let vshort = C.PARAM(20, "SHORT", {MIN: 5, STEP: 5});
    let vlong = C.PARAM(35, "LONG", {MIN: 5, STEP: 5});
    let vm = C.PARAM(10, "M", {MIN: 5, STEP: 5});
    //输入
    let sclose = C.SERIAL("CLOSE");
    //输出
    let diff = C.OUTS("LINE", "diff", {color: RED});
    let dea = C.OUTS("LINE", "dea", {color: BLUE, width: 2});
    let bar = C.OUTS("BAR", "bar", {color: RED});
    //临时序列
    let eshort = [];
    let elong = [];
    //计算
    while(true) {
        let i = yield;
        eshort[i] = EMA(i, sclose, vshort, eshort);
        elong[i] = EMA(i, sclose, vlong, elong);
        diff[i] = eshort[i] - elong[i];
        dea[i] = EMA(i, diff, vm, dea);
        bar[i] = 2 * (diff[i] - dea[i]);
    }
}
    """,
}

# RSV:=(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N))*100;//收盘价与N周期最低值做差，N周期最高值与N周期最低值做差，两差之间做比值。
# K:SMA(RSV,M1,1);//RSV的移动平均值
# D:SMA(K,M2,1);//K的移动平均值
# J:3*K-2*D;
# BACKGROUNDSTYLE(1);

kdj2 = {
    "id": "kdj2",
    "cname": "KDJ2",
    "type": "SUB",
    "src": """
RSV:=(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N))*100;//收盘价与N周期最低值做差，N周期最高值与N周期最低值做差，两差之间做比值。
K:SMA(RSV,M1,1);//RSV的移动平均值
D:SMA(K,M2,1);//K的移动平均值
J:3*K-2*D;
BACKGROUNDSTYLE(1);
""",
    "params": [
        ("N", 1, 100, 20),
        ("M1", 1, 100, 20),
        ("M2", 1, 100, 20),
    ],
    "expected": """
function* kdj(C){
    C.DEFINE({
        type: "SUB",
        cname: "KDJ",
        memo: "",
        state: "KLINE",
    });
    let n = C.PARAM(3, "N");
    let m1 = C.PARAM(5, "M1");
    let m2 = C.PARAM(5, "M2");
    let close = C.SERIAL("CLOSE");
    let high = C.SERIAL("HIGH");
    let low = C.SERIAL("LOW");

    let k = C.OUTS("LINE", "k", {color: RED});
    let d = C.OUTS("LINE", "d", {color: GREEN});
    let j = C.OUTS("LINE", "j", {color: YELLOW});

    let rsv = [];

    while(true) {
        let i = yield;
        let hv = HIGHEST(i, high, n);
        let lv = LOWEST(i, low, n);
        rsv[i] = (hv == lv) ? 0 : (close[i] - lv) / (hv - lv) * 100;
        k[i] = SMA(i, rsv, m1, 1, k);
        d[i] = SMA(i, k, m2, 1, d);
        j[i] = 3*k[i] -2*d[i];
    }
}
    """,
}

adtm2 = {
    "id": "adtm2",
    "cname": "ADTM2",
    "type": "SUB",
    "src": """
//#动态买卖气指标
//副图指标
//@N:1,100,23
//@M:1,100,8
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
DTM:=IFELSE(OPEN<=REF(OPEN,1),0,MAX((HIGH-OPEN),(OPEN-REF(OPEN,1))));//如果开盘价小于等于一个周期前的开盘价，DTM取值为0，否则取最高价减去开盘价和开盘价减去前一个周期开盘价这两个差值中的最大值
DBM:=IFELSE(OPEN>=REF(OPEN,1),0,MAX((OPEN-LOW),(OPEN-REF(OPEN,1))));//如果开盘价大于等于一个周期前的开盘价，DBM取值为0，否则取开盘价减去最低价和开盘价减去前一个周期开盘价这两个差值中的最大值
STM:=SUM(DTM,N);//求N个周期内的DTM的总和
SBM:=SUM(DBM,N);//求N个周期内的DBM的总和
ADTM:IFELSE(STM>SBM,(STM-SBM)/STM,IFELSE(STM=SBM,0,(STM-SBM)/SBM));//如果STM大于SBM，ADTM取值为(STM-SBM)/STM，如果STM等于SBM，ADTM取值为0,如果STM小于SBM，ADTM取值为(STM-SBM)/SBM
ADTMMA:MA(ADTM,M);//求M个周期内的ADTM的简单移动平均
""",
    "params": [
        ("N", 1, 100, 20),
        ("M", 1, 100, 20),
    ],
    "expected": """
    """,
}

arbr2 = {
    "id": "arbr2",
    "cname": "ARBR2",
    "type": "SUB",
    "src": """
TB:=IFELSE(HIGH>REF(CLOSE,1),HIGH-REF(CLOSE,1)+CLOSE-LOW,CLOSE-LOW);//若最高价大于前收盘价则取当根K线下影线与当根K线幅度的和，否则取当根K线下影线长度
TS:=IFELSE(REF(CLOSE,1)>LOW,REF(CLOSE,1)-LOW+HIGH-CLOSE,HIGH-CLOSE);//若前收盘价大于最低价则取当根K线上影线与当根K线幅度的和，否则取当根K线上影线长度
VOL1:=(TB-TS)*VOL/(TB+TS)/10000;//TB与TS差值和成交量求积在与TB和TS的和做商
VOL10:=DMA(VOL1,0.1);//取得VOL1的0.1动态均值
VOL11:=DMA(VOL1,0.05);//取的VOL1的0.05动态均值
RES1:=VOL10-VOL11;//取VOL10与VOL11的差
LON:SUM(RES1,0),COLORSTICK;//取得历史所有K线的RES1的和
MA1:MA(LON,10);//取LON的10周期均值。
""",
    "params": [
    ],
    "expected": """
    """,
}

if __name__ == "__main__":
    def tryconvert(f):
        ret = wenhua_translate(f)
        print ("""
        -INPUT--------------------------------
        %s
        -OUTPUT--------------------------------
        %s
        -EXPECTED--------------------------------
        %s
        """ % (f["src"], json.dumps(ret, indent=2), f["expected"]))
    tryconvert(macd2)

