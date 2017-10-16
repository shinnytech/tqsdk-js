#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "PSY",
    "cname": "心理线",
    "type": "SUB",
    "src": """
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
PSY:COUNT(CLOSE>REF(CLOSE,1),N)/N*100;//N个周期内满足收盘价大于一个周期前的收盘价的周期数，比N*100；
PSYMA:MA(PSY,M);//PSY在M个周期内的简单移动平均；
""",
    "params": [
        ("N", 2, 100, 12),
        ("M", 2, 100, 6),
    ],
    "expected": """
    """,
}
