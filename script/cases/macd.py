#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "MACD",
    "cname": "MACD",
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
        ("SHORT", 1, 100, 12),
        ("LONG", 1, 100, 26),
        ("M", 1, 100, 9),
    ],
    "expected": """
    """,
}
