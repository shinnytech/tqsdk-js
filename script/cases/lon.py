#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "LON",
    "cname": "长线",
    "type": "MAIN",
    "src": """
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
TB:=IFELSE(HIGH>REF(CLOSE,1),HIGH-REF(CLOSE,1)+CLOSE-LOW,CLOSE-LOW);//若最高价大于前收盘价则取当根K线下影线与当根K线幅度的和，否则取当根K线下影线长度
TS:=IFELSE(REF(CLOSE,1)>LOW,REF(CLOSE,1)-LOW+HIGH-CLOSE,HIGH-CLOSE);//若前收盘价大于最低价则取当根K线上影线与当根K线幅度的和，否则取当根K线上影线长度
VOL1:=(TB-TS)*VOL/(TB+TS)/10000;//TB与TS差值和成交量求积在与TB和TS的和做商
VOL10:=DMA(VOL1,0.1);//取得VOL1的0.1动态均值
VOL11:=DMA(VOL1,0.05);//取的VOL1的0.05动态均值
RES1:=VOL10-VOL11;//取VOL10与VOL11的差
LON:SUM(RES1,0),COLORSTICK;//取得历史所有K线的RES1的和
MA1:MA(LON,10);//取LON的10周期均值。
""",
    "params": [
    ],
    "expected": """
    """,
}
