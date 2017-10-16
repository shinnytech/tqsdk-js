#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "ADTM",
    "cname": "动态买卖气指标",
    "type": "SUB",
    "src": """
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
        ("N", 1, 100, 23),
        ("M", 1, 100, 8),
    ],
    "expected": """
    """,
}
