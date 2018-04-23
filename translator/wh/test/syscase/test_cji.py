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

let S_1 = C.OUTS("PCBAR", "S_1", {color: RED});
let OPID = C.OUTS("LINE", "OPID", {color: GREEN});

while(true){
let i = yield;
S_1[i] = C.DS.volume[i];
OPID[i] = C.DS.close_oi[i];
}
}        
               
      
              """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
