#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "MFI",
            "cname": "资金流量指标",
            "type": "SUB",
            "src": """
        //该模型仅仅用来示范如何根据指标编写简单的模型
        //用户需要根据自己交易经验，进行修改后再实际应用!!!
        // //后为文字说明，编写模型时不用写出
        TYP : (HIGH + LOW + CLOSE)/3;//当根K线的最高值最低值收盘价3者之间取简单均值。
        S1:SUM(IFELSE(TYP>REF(TYP,1),TYP*VOL,0),N);
        S2:SUM(IFELSE(TYP<REF(TYP,1),TYP*VOL,0),N);
        MR:S1/S2;//如果TYP大于前一周期TYP时取TYP乘以成交量，否则取0，对该值做N周期累加求和。如果TYP小于前一周期TYP取TYP乘以成交量，否则取0，对该值做N周期累加求和。两求和值之间进行比值计算。
        MFI:100-(100/(1+MR));
        """,
            "params": [
                ("N", 2, 300, 14),
            ],
            "expected": """

function* MFI(C){
C.DEFINE({
type: "SUB",
cname: "资金流量指标",
state: "KLINE",
yaxis: [],
});
//定义指标参数
let N = C.PARAM(14.000000, "N", {"MIN": 2.000000, "MAX":300.000000});
//输入序列
let HIGH = C.SERIAL("HIGH");
let LOW = C.SERIAL("LOW");
let CLOSE = C.SERIAL("CLOSE");
let VOLUME = C.SERIAL("VOLUME");
//输出序列
let TYP = C.OUTS("LINE", "TYP", {color: RED});
let S1 = C.OUTS("LINE", "S1", {color: GREEN});
let S2 = C.OUTS("LINE", "S2", {color: BLUE});
let MR = C.OUTS("LINE", "MR", {color: CYAN});
let MFI = C.OUTS("LINE", "MFI", {color: GRAY});
//临时序列
let S_1 = [];
let S_2 = [];
//指标计算
while(true){
let i = yield;
TYP[i]=((HIGH[i] + LOW[i]) + CLOSE[i]) / 3;
S_1[i]=((TYP[i] > REF(i, TYP, 1)) ? (TYP[i] * VOLUME[i]) : 0);
S1[i]=SUM(i, S_1, N, S1);
S_2[i]=((TYP[i] < REF(i, TYP, 1)) ? (TYP[i] * VOLUME[i]) : 0);
S2[i]=SUM(i, S_2, N, S2);
MR[i]=S1[i] / S2[i];
MFI[i]=100 - (100 / (1 + MR[i]));
}
}        
           
                """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
