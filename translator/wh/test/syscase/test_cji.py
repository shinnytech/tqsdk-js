#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert


class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "CJI",
            "cname": "CJI",
            "type": "SUB",
            "src": """
        VOL,VOLUMESTICK;
        OPID:OPI;
        """,
            "params": [
            ],
            "expected": """

function* CJI(C){
C.DEFINE({
type: "SUB",
cname: "CJI",
state: "KLINE",
yaxis: [],
});
//定义指标参数

//输入序列
let VOLUME = C.SERIAL("VOLUME");
let CLOSE_OI = C.SERIAL("CLOSE_OI");
//输出序列
let S_1 = C.OUTS("PCBAR", "S_1", {color: RED});
let OPID = C.OUTS("LINE", "OPID", {color: GREEN});
//临时序列

//指标计算
while(true){
let i = yield;
S_1[i] = VOLUME[i];
OPID[i] = CLOSE_OI[i];
}
}        
                
      
              """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
