#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_trade(self):
        case = {
            "id": "fxp",
            "cname": "fxp",
            "type": "MAIN",
            "src": """
        H>=MA(C, 5), BPK;
        L<=MA(L, 5), SPK;
        """,
            "params": [
            ],
            "expected": """

function* fxp(C){
C.DEFINE({
type: "MAIN",
cname: "fxp",
state: "KLINE",
yaxis: [],
});
//定义指标参数

//输入序列
let HIGH = C.SERIAL("HIGH");
let CLOSE = C.SERIAL("CLOSE");
let LOW = C.SERIAL("LOW");
//输出序列

//临时序列
let S_1 = [];
let S_2 = [];
//指标计算
while(true){
let i = yield;
S_1[i]=MA(i, CLOSE, 5, S_1);
if((HIGH[i] >= S_1[i])) C.ORDER("BUY", "CLOSEOPEN", 1);
S_2[i]=MA(i, LOW, 5, S_2);
if((LOW[i] <= S_2[i])) C.ORDER("SELL", "CLOSEOPEN", 1);
}
}        
            """,
        }
        self.assert_convert(case)

if __name__ == '__main__':
    unittest.main()

