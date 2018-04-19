#!/usr/bin/env python
#coding=utf-8

import logging
import ply.lex as lex
import ply.yacc as yacc
import wh.whlex
from wh.whlex import tokens


logger = logging.getLogger()
# logger.setLevel(logging.DEBUG)
# console = logging.StreamHandler() # 配置日志输出到控制台
# console.setLevel(logging.DEBUG) # 设置输出到控制台的最低日志级别
# logger.addHandler(console)


class TranslateException(Exception):
    def __init__(self, err_line, err_col, err_msg):
        self.err_line = err_line
        self.err_col = err_col
        self.err_msg = err_msg
    def __str__(self):
        return "line:%d, col:%d, msg:%s" % (self.err_line, self.err_col, self.err_msg)


precedence = (
    ('left', 'SEMICOLON'),
    ('left', 'COLON'),
    ('left', 'COMMA'),
    ('left', "AND", "OR"),
    ('left', "LT", "LTE", "GT", "GTE", "EQUALS", "NOT_EQUALS"),
    ('left', 'PLUS', 'MINUS'),
    ('left', 'TIMES', 'DIVIDE'),
    ('right', 'UMINUS'),
    ('left', "LPAREN", "RPAREN"),
)


def p_program(p):
    """
    program : program line
            | line
    """
    if len(p) == 3:
        p[0] = p[1] + [["LINE", p.lexer.lineno, p[2]]]
    elif len(p) == 2:
        p[0] = ["PROG", ["LINE", p.lexer.lineno, p[1]]]


def p_program_error(p):
    """program : error"""
    p[0] = None
    p.parser.error = 1


def p_line_end(p):
    """
    lineend : SEMICOLON
            | lineend SEMICOLON
            | NEWLINE
            | lineend NEWLINE
    """
    p[0] = p[1]


def p_line_lineend(p):
    """
    line : lineend
    """
    p[0] = ["NULL"]


def p_line_output_serial_define(p):
    """
    line : ID COLON statement lineend
    """
    logger.debug("p_line_output_serial_define: %s, %s", p[1], p[3])
    p[0] = ["OUT_SERIAL", p[1], p[3]]


def p_line_temp_serial_define(p):
    """
    line : ID COLON_EQUALS statement lineend
    """
    logger.debug("p_line_temp_serial_define: %s, %s", p[1], p[3])
    p[0] = ["TMP_SERIAL", p[1], p[3]]


def p_line_statement(p):
    """
    line : statement lineend
    """
    p[0] = ["OUT_SERIAL", "_", p[1]]


def p_line_dstatement(p):
    """
    line : dstatement lineend
    """
    p[0] = ["OUT_DRAW", p[1]]

def p_line_autofilter(p):
    """
    line : AUTOFILTER lineend
    """
    p[0] = ["AUTOFILTER"]


def p_line_backgroundstyle(p):
    """
    line : BACKGROUNDSTYLE LPAREN NUMBER RPAREN lineend
    """
    p[0] = ["BACKGROUNDSTYLE", p[3]]


def p_statement_with_ofunc(p):
    """
    statement : statement COMMA OFUNC
    """
    logger.debug("p_statement_with_ofunc: %s, %s", p[1], p[3])
    p[0] = ["OUT_FUNC", p[1], p[3]]


def p_statement_with_color(p):
    """
    statement : statement COMMA color
    """
    p[0] = ["SERIAL_COLOR", p[1], p[3]]


def p_statement_with_linestyle(p):
    """
    statement : statement COMMA LINESTYLE
    """
    p[0] = ["SERIAL_LINESTYLE", p[1], p[3]]


def p_statement_with_linewidth(p):
    """
    statement : statement COMMA LINEWIDTH
    """
    p[0] = ["SERIAL_LINEWIDTH", p[1], p[3]]


def p_statement_with_expression(p):
    """
    statement : expression
    """
    p[0] = p[1]


def p_color(p):
    """
    color : COLOR
          | RGB LPAREN NUMBER COMMA NUMBER COMMA NUMBER RPAREN
    """
    if len(p) == 2:
        p[0] = p[1]
    else:
        p[0] = "RGB(%s, %s, %s)" % (p[3], p[5], p[7])


def p_line_order(p):
    """
    line : statement COMMA ORDER lineend
         | statement COMMA ORDER LPAREN expression RPAREN lineend
    """
    logger.debug("p_line_order: %s", p[1])
    if len(p) == 5:
        p[0] = ["ORDER", p[3], p[1], 1]
    else:
        p[0] = ["ORDER", p[3], p[1], p[5]]


def p_expression_paren(t):
    """
    expression : LPAREN expression RPAREN
    """
    t[0] = t[2]


def p_expression_with_color(p):
    """
    expression : color
    """
    p[0] = ["COLOR", p[1]]


def p_expression_binop(p):
    """
    expression : expression PLUS expression
              | expression MINUS expression
              | expression TIMES expression
              | expression DIVIDE expression
              | expression LT expression
              | expression LTE expression
              | expression GT expression
              | expression GTE expression
              | expression AND expression
              | expression OR expression
              | expression EQUALS expression
              | expression NOT_EQUALS expression
    """
    logger.debug("p_expressionv_binop: %s", p[1], p[2], p[3])
    p[0] = ["BINOP", p[2], p[1], p[3]]


def p_expression_uminus(p):
    """
    expression : MINUS expression %prec UMINUS
    """
    p[0] = ["UMINUS", p[2]]


def p_expression_number(p):
    """
    expression : NUMBER
    """
    logger.debug("p_expression_number: %s", p[1])
    p[0] = ["NUMBER", p[1]]


def p_expression_string(p):
    """
    expression : STRING
    """
    logger.debug("p_expression_string: %s", p[1])
    p[0] = ["STRING", p[1]]


def p_expressions_id(p):
    """
    expression : ID
               | ID LPAREN RPAREN
               | ID LPAREN expression RPAREN
               | ID LPAREN expression COMMA expression RPAREN
               | ID LPAREN expression COMMA expression COMMA expression RPAREN
               | ID LPAREN expression COMMA expression COMMA expression COMMA expression RPAREN
               | ID LPAREN expression COMMA expression COMMA expression COMMA expression COMMA expression RPAREN
               | ID LPAREN expression COMMA expression COMMA expression COMMA expression COMMA expression COMMA expression RPAREN
               | ID LPAREN expression COMMA expression COMMA expression COMMA expression COMMA expression COMMA expression COMMA expression RPAREN
    """
    logger.debug("p_expressions_function: %s", p[1])
    if len(p) <= 4:
        p[0] = ["ID", p[1]]
    elif len(p) == 5:
        p[0] = ["ID", p[1], p[3]]
    elif len(p) == 7:
        p[0] = ["ID", p[1], p[3], p[5]]
    elif len(p) == 9:
        p[0] = ["ID", p[1], p[3], p[5], p[7]]
    elif len(p) == 11:
        p[0] = ["ID", p[1], p[3], p[5], p[7], p[9]]
    elif len(p) == 13:
        p[0] = ["ID", p[1], p[3], p[5], p[7], p[9], p[11]]
    elif len(p) == 15:
        p[0] = ["ID", p[1], p[3], p[5], p[7], p[9], p[11], p[13]]


def p_dstatement_drawfunc(p):
    """
    dstatement : DRAWFUNC
               | DRAWFUNC LPAREN RPAREN
               | DRAWFUNC LPAREN expression RPAREN
               | DRAWFUNC LPAREN expression COMMA expression RPAREN
               | DRAWFUNC LPAREN expression COMMA expression COMMA expression RPAREN
               | DRAWFUNC LPAREN expression COMMA expression COMMA expression COMMA expression RPAREN
               | DRAWFUNC LPAREN expression COMMA expression COMMA expression COMMA expression COMMA expression RPAREN
               | DRAWFUNC LPAREN expression COMMA expression COMMA expression COMMA expression COMMA expression COMMA expression RPAREN
               | DRAWFUNC LPAREN expression COMMA expression COMMA expression COMMA expression COMMA expression COMMA expression COMMA expression RPAREN
    """
    if len(p) <= 4:
        p[0] = ["DRAW_FUNC", p[1]]
    elif len(p) == 5:
        p[0] = ["DRAW_FUNC", p[1], p[3]]
    elif len(p) == 7:
        p[0] = ["DRAW_FUNC", p[1], p[3], p[5]]
    elif len(p) == 9:
        p[0] = ["DRAW_FUNC", p[1], p[3], p[5], p[7]]
    elif len(p) == 11:
        p[0] = ["DRAW_FUNC", p[1], p[3], p[5], p[7], p[9]]
    elif len(p) == 13:
        p[0] = ["DRAW_FUNC", p[1], p[3], p[5], p[7], p[9], p[11]]
    elif len(p) == 15:
        p[0] = ["DRAW_FUNC", p[1], p[3], p[5], p[7], p[9], p[11], p[13]]


def p_dstatement_with_color(p):
    """
    dstatement : dstatement COMMA color
    """
    p[0] = ["DRAW_COLOR", p[1], p[3]]


def p_dstatement_with_linewidth(p):
    """
    dstatement : dstatement COMMA LINEWIDTH
    """
    p[0] = ["DRAW_LINEWIDTH", p[1], p[3]]


def p_dstatement_with_align(p):
    """
    dstatement : dstatement COMMA ALIGN
    """
    p[0] = ["DRAW_ALIGN", p[1], p[3]]


def p_dstatement_with_linestyle(p):
    """
    dstatement : dstatement COMMA LINESTYLE
    """
    p[0] = ["DRAW_LINESTYLE", p[1], p[3]]


def p_dstatement_with_fontsize(p):
    """
    dstatement : dstatement COMMA FONTSIZE
    """
    p[0] = ["DRAW_FONTSIZE", p[1], p[3]]


def p_error(p):
    if p:
        raise TranslateException(err_line=p.lexer.lineno,
                                 err_col=p.lexer.lexpos - p.lexer.__dict__.get("linestart", 0),
                                 err_msg="不应该出现在这里的字符 %s" % repr(p.value))
    else:
        raise TranslateException(err_line=-1,
                                 err_col=-1,
                                 err_msg="代码未正确结束,请检查括号匹配和行末分号等")



def parse(data, debug=0):
    lexer = wh.whlex.get_lexer()
    bparser = yacc.yacc()
    bparser.error = 0
    p = bparser.parse(data, lexer=lexer, debug=debug)
    if bparser.error:
        return None
    return p



#---------------------------------------------------------------------------------
if __name__ == "__main__":
    wenhua_src = """
ADTM:IFELSE(STM>SBM,(STM-SBM)/STM,IFELSE(STM=SBM,0,(STM-SBM)/SBM))\n
\n

    """
    # wenhua_src = """
    #     MID:MA(CLOSE,N);//求N个周期的收盘价均线，称为布林通道中轨
    #     TMP2:=STD(CLOSE,M);//求M个周期内的收盘价的标准差
    #     TOP:MID+P*TMP2;//布林通道上轨
    #     BOTTOM:MID-P*TMP2;//布林通道下轨
    #     BOTTOM2:MA(MID,N);
    # """
    x = parse(wenhua_src)
    print(x)
