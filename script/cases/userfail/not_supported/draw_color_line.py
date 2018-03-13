#!/usr/bin/env python
#coding=utf-8


#还未支持 DRAWCOLORLINE

case = {
    "id": "eee",
    "cname": "eee",
    "type": "SUB",
    "src": """"EMA1:EMA(CLOSE,10),COLORWHITE;
    EMA22:EMA(CLOSE,25);
    DRAWCOLORLINE(EMA22>=EMA1,EMA22,COLORGREEN,COLORRED);
""",
    "params": [
    ],
    "expected": """
    """,
}
