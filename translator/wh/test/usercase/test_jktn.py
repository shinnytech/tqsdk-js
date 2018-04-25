#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_trade(self):
        case = {
            "id": "JKTN",
            "cname": "JKTN",
            "type": "MAIN",
            "src": """
//该策略为趋势跟踪交易策略，适用较大周期，如日线。
//该模型仅用作模型开发案例，依此入市，风险自负。
////////////////////////////////////////////////////////
MOVAVGVAL:MA((HIGH+LOW+CLOSE)/3,AVGLENGTH);//三价均线
TRUEHIGH1:=IF(HIGH>REF(C,1),HIGH,REF(C,1));
TRUELOW1:=IF(LOW<=REF(C,1),LOW,REF(C,1));
TRUERANGE1:=IF(ISLASTBAR,H-L,TRUEHIGH1-TRUELOW1);
UPBAND:MOVAVGVAL+MA(TRUERANGE1,ATRLENGTH);
DNBAND:MOVAVGVAL-MA(TRUERANGE1,ATRLENGTH);//通道上下轨
LIQUIDPOINT:=MOVAVGVAL;//出场条件
MOVAVGVAL>REF(MOVAVGVAL,1)&&C>UPBAND,BK;//三价均线向上，并且价格上破通道上轨，开多单
C<LIQUIDPOINT,SP;//持有多单时，价格下破三价均线，平多单
MOVAVGVAL<REF(MOVAVGVAL,1)&&C<DNBAND,SK;//三价均线向下，并且价格下破通道下轨，开空单
C>LIQUIDPOINT,BP;//持有空单时，价格上破三价均线，平空单
AUTOFILTER;
        """,
            "params": [
                ("AVGLENGTH", 1, 100, 20),
                ("ATRLENGTH", 1, 100, 3),
            ],
            "expected": """

function* JKTN(C){
C.DEFINE({
type: "MAIN",
cname: "JKTN",
state: "KLINE",
yaxis: [],
});
let AVGLENGTH = C.PARAM(20.000000, "AVGLENGTH", {"MIN": 1.000000, "MAX":100.000000});
let ATRLENGTH = C.PARAM(3.000000, "ATRLENGTH", {"MIN": 1.000000, "MAX":100.000000});
let MOVAVGVAL = C.OUTS("LINE", "MOVAVGVAL", {color: RED});
let UPBAND = C.OUTS("LINE", "UPBAND", {color: GREEN});
let DNBAND = C.OUTS("LINE", "DNBAND", {color: BLUE});
let S_1 = [];
let TRUEHIGH1 = [];
let TRUELOW1 = [];
let TRUERANGE1 = [];
let S_2 = [];
let S_3 = [];
let LIQUIDPOINT = [];
while(true){
let i = yield;
S_1[i]=((C.DS.high[i] + C.DS.low[i]) + C.DS.close[i]) / 3;
MOVAVGVAL[i]=MA(i, S_1, AVGLENGTH, MOVAVGVAL);
TRUEHIGH1[i]=((C.DS.high[i] > REF(i, C.DS.close, 1)) ? C.DS.high[i] : REF(i, C.DS.close, 1));
TRUELOW1[i]=((C.DS.low[i] <= REF(i, C.DS.close, 1)) ? C.DS.low[i] : REF(i, C.DS.close, 1));
TRUERANGE1[i]=(C.ISLAST(i) ? (C.DS.high[i] - C.DS.low[i]) : (TRUEHIGH1[i] - TRUELOW1[i]));
S_2[i]=MA(i, TRUERANGE1, ATRLENGTH, S_2);
UPBAND[i]=MOVAVGVAL[i] + S_2[i];
S_3[i]=MA(i, TRUERANGE1, ATRLENGTH, S_3);
DNBAND[i]=MOVAVGVAL[i] - S_3[i];
LIQUIDPOINT[i] = MOVAVGVAL[i];
if(((MOVAVGVAL[i] > REF(i, MOVAVGVAL, 1)) && (C.DS.close[i] > UPBAND[i]))) C.ORDER(i, "BUY", "OPEN", 1);
if((C.DS.close[i] < LIQUIDPOINT[i])) C.ORDER(i, "SELL", "CLOSE", 1);
if(((MOVAVGVAL[i] < REF(i, MOVAVGVAL, 1)) && (C.DS.close[i] < DNBAND[i]))) C.ORDER(i, "SELL", "OPEN", 1);
if((C.DS.close[i] > LIQUIDPOINT[i])) C.ORDER(i, "BUY", "CLOSE", 1);
C.TRADE_OC_CYCLE(true);
}
}        
      
   
            """,
        }
        self.assert_convert(case)

if __name__ == '__main__':
    unittest.main()

