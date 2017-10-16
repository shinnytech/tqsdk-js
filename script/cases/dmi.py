#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "DMI",
    "cname": "趋向指标",
    "type": "SUB",
    "src": """
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
TR := SUM(MAX(MAX(HIGH-LOW,ABS(HIGH-REF(CLOSE,1))),ABS(LOW-REF(CLOSE,1))),N);//最高价与最低价做差，最高价与前一周期收盘价做差，最低价与前一周期收盘价作差，在上述三个数据中取绝对值最大者，对该最大值做N周期累加求和。。
HD := HIGH-REF(HIGH,1);//最高价与前一周期最高价做差
LD := REF(LOW,1)-LOW;//前一周期最低价与最低价做差
DMP:= SUM(IFELSE(HD>0 && HD>LD,HD,0),N);//如果HD>0并且HD>LD,取HD否则取0,对取值做N周期累加求和。
DMM:= SUM(IFELSE(LD>0 && LD>HD,LD,0),N);//如果LD>0并且LD>HD,取LD否则取0,对取值做N周期累加求和。
PDI: DMP*100/TR;
MDI: DMM*100/TR;
ADX: MA(ABS(MDI-PDI)/(MDI+PDI)*100,M);//MDI与PDI差的绝对值与(MDI+PDI)*100做比值，取该比值的M个周期均值。
ADXR:(ADX+REF(ADX,M))/2;
BACKGROUNDSTYLE(1);
""",
    "params": [
        ("N", 1, 100, 14),
        ("M", 1, 100, 6),
        ("N0", 1, 100, 20),
        ("M0", 1, 100, 20),
    ],
    "expected": """
    """,
}
