#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "MIKE",
    "cname": "麦克指标",
    "type": "MAIN",
    "src": """
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
TYP:=(HIGH+LOW+CLOSE)/3;//当根K线的最高值最低值收盘价的简单均值定义为TYP。
LL:=LLV(LOW,N);//N个周期的最低值
HH:=HHV(HIGH,N);//N个周期的最高值
WR:TYP+(TYP-LL);
MR:TYP+(HH-LL);
SR:2*HH-LL;
WS:TYP-(HH-TYP);
MS:TYP-(HH-LL);
SS:2*LL-HH;
""",
    "params": [
        ("N", 1, 200, 12),
    ],
    "expected": """
    """,
}
