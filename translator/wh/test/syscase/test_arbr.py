#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "ARBR",
            "cname": "人气意愿指标",
            "type": "SUB",
            "src": """
        //该模型仅仅用来示范如何根据指标编写简单的模型
        //用户需要根据自己交易经验，进行修改后再实际应用!!!
        // //后为文字说明，编写模型时不用写出
        AR : SUM(HIGH-OPEN,N)/SUM(OPEN-LOW,N)*100;//N个周期内的最高价减去开盘价的和与N个周期内的开盘价减去最低价的和的百分比
        BR : SUM(MAX(0,HIGH-REF(CLOSE,1)),N)/SUM(MAX(0,REF(CLOSE,1)-LOW),N)*100;//取最高价减去一个周期前的收盘价的与0中的最大值，求和，取一个周期前的收盘价减去最低价与0中的最大值，求和，两个和的百分比
        """,
            "params": [
                ("N", 2, 300, 26),
                ("M", 0, 100, 2),
                ("P", 0, 200, 120),
                ("Q", 0, 200, 30),
            ],
            "expected": """

function* ARBR(C){
C.DEFINE({
type: "SUB",
cname: "人气意愿指标",
state: "KLINE",
yaxis: [],
});
//定义指标参数
let N = C.PARAM(26.000000, "N", {"MIN": 2.000000, "MAX":300.000000});
let M = C.PARAM(2.000000, "M", {"MIN": 0.000000, "MAX":100.000000});
let P = C.PARAM(120.000000, "P", {"MIN": 0.000000, "MAX":200.000000});
let Q = C.PARAM(30.000000, "Q", {"MIN": 0.000000, "MAX":200.000000});
//输入序列
let HIGH = C.SERIAL("HIGH");
let OPEN = C.SERIAL("OPEN");
let LOW = C.SERIAL("LOW");
let CLOSE = C.SERIAL("CLOSE");
//输出序列
let AR = C.OUTS("LINE", "AR", {color: RED});
let BR = C.OUTS("LINE", "BR", {color: GREEN});
//临时序列
let S_1 = [];
let S_2 = [];
let S_3 = [];
let S_4 = [];
let S_5 = [];
let S_6 = [];
let S_7 = [];
let S_8 = [];
//指标计算
while(true){
let i = yield;
S_1[i]=HIGH[i] - OPEN[i];
S_2[i]=SUM(i, S_1, N, S_2);
S_3[i]=OPEN[i] - LOW[i];
S_4[i]=SUM(i, S_3, N, S_4);
AR[i]=(S_2[i] / S_4[i]) * 100;
S_5[i]=MAX(0, (HIGH[i] - REF(i, CLOSE, 1)));
S_6[i]=SUM(i, S_5, N, S_6);
S_7[i]=MAX(0, (REF(i, CLOSE, 1) - LOW[i]));
S_8[i]=SUM(i, S_7, N, S_8);
BR[i]=(S_6[i] / S_8[i]) * 100;
}
}                              
            """,
        }
        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
