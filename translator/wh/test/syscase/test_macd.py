#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "MACD",
            "cname": "MACD",
            "type": "SUB",
            "src": """
        //该模型仅仅用来示范如何根据指标编写简单的模型
        //用户需要根据自己交易经验，进行修改后再实际应用!!!
        // //后为文字说明，编写模型时不用写出
        DIFF : EMA(CLOSE,SHORT) - EMA(CLOSE,LONG);//短周期与长周期的收盘价的指数平滑移动平均值做差。
        DEA  : EMA(DIFF,M);//DIFF的M个周期指数平滑移动平均
        2*(DIFF-DEA),COLORSTICK;//DIFF减DEA的2倍画柱状线

        """,
            "params": [
                ("SHORT", 1, 100, 12),
                ("LONG", 1, 100, 26),
                ("M", 1, 100, 9),
            ],
            "expected": """

function* MACD(C){
C.DEFINE({
type: "SUB",
cname: "MACD",
state: "KLINE",
yaxis: [],
});
let SHORT = C.PARAM(12.000000, "SHORT", {"MIN": 1.000000, "MAX":100.000000});
let LONG = C.PARAM(26.000000, "LONG", {"MIN": 1.000000, "MAX":100.000000});
let M = C.PARAM(9.000000, "M", {"MIN": 1.000000, "MAX":100.000000});
let DIFF = C.OUTS("LINE", "DIFF", {color: RED});
let DEA = C.OUTS("LINE", "DEA", {color: GREEN});
let S_3 = C.OUTS("RGBAR", "S_3", {color: BLUE});
let S_1 = [];
let S_2 = [];
while(true){
let i = yield;
S_1[i]=EMA(i, C.DS.close, SHORT, S_1);
S_2[i]=EMA(i, C.DS.close, LONG, S_2);
DIFF[i]=S_1[i] - S_2[i];
DEA[i]=EMA(i, DIFF, M, DEA);
S_3[i]=2 * (DIFF[i] - DEA[i]);
}
}        
        
          
            """,
        }
        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
