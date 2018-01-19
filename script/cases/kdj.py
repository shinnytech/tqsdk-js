#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "KDJ",
    "cname": "KDJ",
    "type": "SUB",
    "src": """
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
RSV:=(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N))*100;//收盘价与N周期最低值做差，N周期最高值与N周期最低值做差，两差之间做比值。
K:SMA(RSV,M1,1);//RSV的移动平均值
D:SMA(K,M2,1);//K的移动平均值
J:3*K-2*D;
BACKGROUNDSTYLE(1);
""",
    "params": [
        ("N", 1, 100, 9),
        ("M1", 2, 100, 3),
        ("M2", 2, 100, 3),
    ],
    "expected": """
    """,
}
