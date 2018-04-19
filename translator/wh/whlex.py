#!/usr/bin/env python
#coding=utf-8


import logging
import ply.lex as lex
from wh.utils import add_error

logger = logging.getLogger()
logger.setLevel(logging.DEBUG)


tokens = [
    "ID", "NUMBER",
    "STRING",
    "PLUS", "MINUS", "TIMES", "DIVIDE",
    "LPAREN", "RPAREN",
    "COMMA", "SEMICOLON", "COLON", "COLON_EQUALS",
    "LT", "LTE", "GT", "GTE", "EQUALS", "NOT_EQUALS",
    "AND", "OR",
    "NEWLINE",

    "COLOR",
    "RGB",
    "ALIGN",
    "FONTSIZE",
    "LINEWIDTH",
    "LINESTYLE",
    "OFUNC",
    "DRAWFUNC",
    "ORDER",

    "BACKGROUNDSTYLE",
    "AUTOFILTER",
]


reserved = {
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
    "RGB": "RGB",
    # 对齐方式
    "ALIGN0": "ALIGN",
    "ALIGN1": "ALIGN",
    "ALIGN2": "ALIGN",
    "VALIGN0": "ALIGN",
    "VALIGN1": "ALIGN",
    "VALIGN2": "ALIGN",
    # 线条粗细
    "LINETHICK1": "LINEWIDTH",
    "LINETHICK2": "LINEWIDTH",
    "LINETHICK3": "LINEWIDTH",
    "LINETHICK4": "LINEWIDTH",
    "LINETHICK5": "LINEWIDTH",
    "LINETHICK6": "LINEWIDTH",
    "LINETHICK7": "LINEWIDTH",
    # 线条类型
    "DOT": "LINESTYLE",
    "POINTDOT": "LINESTYLE",
    "CIRCLEDOT": "LINESTYLE",
    "CROSSDOT": "LINESTYLE",
    "DASHDOT": "LINESTYLE",
    "DASHDOTDOT": "LINESTYLE",
    # 字体大小
    "FONTSIZE8": "FONTSIZE",
    "FONTSIZE9": "FONTSIZE",
    "FONTSIZE10": "FONTSIZE",
    "FONTSIZE16": "FONTSIZE",
    "FONTSIZE20": "FONTSIZE",
    # 输出函数
    "COLORSTICK": "OFUNC",
    "VOLUMESTICK": "OFUNC",
    "OPISTICK": "OFUNC",
    # 绘图函数
    "DRAWLINE": "DRAWFUNC",
    "DRAWTEXT": "DRAWFUNC",
    "DRAWSL": "DRAWFUNC",
    "DRAWICON": "DRAWFUNC",
    "STICKLINE": "DRAWFUNC",
    # 特殊函数
    "BACKGROUNDSTYLE": "BACKGROUNDSTYLE",
    "AUTOFILTER": "AUTOFILTER",
    # 交易函数
    "BK": "ORDER",
    "SK": "ORDER",
    "BP": "ORDER",
    "SP": "ORDER",
    "BPK": "ORDER",
    "SPK": "ORDER",
}

# Tokens
def t_ID(t):
    r'[a-zA-Z_][a-zA-Z_0-9]*'
    t.type = reserved.get(t.value, None)    # Check for reserved words
    if t.type:
        return t
    t.type = "ID"
    return t

t_COLON_EQUALS = r':\s*='
t_PLUS    = r'\+'
t_MINUS   = r'-'
t_TIMES   = r'\*'
t_DIVIDE  = r'/'
t_EQUALS  = r'='
t_NOT_EQUALS  = r'<>'
t_COMMA  = r','
t_SEMICOLON  = r';'
t_COLON  = r':'
t_LPAREN  = r'\('
t_RPAREN  = r'\)'
t_LT = r'<'
t_LTE = r'<\s*='
t_GT = r'>'
t_GTE = r'>\s*='
t_AND = r'&&'
t_OR = r'\|\|'
t_NUMBER = r'[\d\.]+'
t_STRING = r"'.*'"
t_ignore = "\r\t "
t_ignore_COMMENT = r"//.*"


def t_NEWLINE(t):
    r'\n'
    t.lexer.lineno += 1
    t.lexer.linestart = t.lexer.lexpos
    return t


def t_error(t):
    add_error(t.lexer.lineno, t.lexer.lexpos - t.lexer.__dict__.get("linestart", 0) + 1, "不应该出现在这里的字符 %s" % repr(t.value[0]))
    t.lexer.skip(1)

def get_lexer():
    lexer = lex.lex(debug=0)
    return lexer

if __name__ == '__main__':
     lex.runmain()