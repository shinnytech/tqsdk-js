#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "ASI",
    "cname": "振动升降指标",
    "type": "SUB",
    "src": """
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
LC:=REF(CLOSE,1);//一个周期前的收盘价
AA:ABS(HIGH-LC);//最高价与一个周期前的收盘价的差值的绝对值
BB:ABS(LOW-LC);//最低价与一个周期前的收盘价的差值的绝对值
CC:ABS(HIGH-REF(LOW,1));//最高价与一个周期前的最低价的差值的绝对值
DD:ABS(LC-REF(OPEN,1));//一个周期前的收盘价与一个周期前的开盘价的差值的绝对值
R:IFELSE(AA>BB&&AA>CC,AA+BB/2+DD/4,IFELSE(BB>CC&&BB>AA,BB+AA/2+DD/4,CC+DD/4));//如果AA>BB&&AA>CC,R取值为AA+BB/2+DD/4,如果BB>CC&&BB>AA,R取值为BB+AA/2+DD/4,否则R取值为CC+DD/4
X:(CLOSE-LC+(CLOSE-OPEN)/2+LC-REF(OPEN,1));//最新价减去一个周期前的收盘价加上开盘价与最新价的二分之一，再加上一个周期前的收盘价与开盘价的差值
SI:16*X/R*MAX(AA,BB);
ASI:SUM(SI,0);//从本地数据第一个数据开始求SI的总和
""",
    "params": [
    ],
    "expected": """
    """,
}
