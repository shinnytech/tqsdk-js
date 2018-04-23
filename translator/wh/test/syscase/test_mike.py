#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
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

function* MIKE(C){
C.DEFINE({
type: "MAIN",
cname: "麦克指标",
state: "KLINE",
yaxis: [],
});
let N = C.PARAM(12.000000, "N", {"MIN": 1.000000, "MAX":200.000000});
let WR = C.OUTS("LINE", "WR", {color: RED});
let MR = C.OUTS("LINE", "MR", {color: GREEN});
let SR = C.OUTS("LINE", "SR", {color: BLUE});
let WS = C.OUTS("LINE", "WS", {color: CYAN});
let MS = C.OUTS("LINE", "MS", {color: GRAY});
let SS = C.OUTS("LINE", "SS", {color: MAGENTA});
let TYP = [];
let LL = [];
let HH = [];
while(true){
let i = yield;
TYP[i]=((C.DS.high[i] + C.DS.low[i]) + C.DS.close[i]) / 3;
LL[i]=LOWEST(i, C.DS.low, N);
HH[i]=HIGHEST(i, C.DS.high, N);
WR[i]=TYP[i] + (TYP[i] - LL[i]);
MR[i]=TYP[i] + (HH[i] - LL[i]);
SR[i]=(2 * HH[i]) - LL[i];
WS[i]=TYP[i] - (HH[i] - TYP[i]);
MS[i]=TYP[i] - (HH[i] - LL[i]);
SS[i]=(2 * LL[i]) - HH[i];
}
}        
            

            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
