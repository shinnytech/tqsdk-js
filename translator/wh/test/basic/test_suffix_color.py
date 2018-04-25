#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_trade(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """EMA1:EMA(CLOSE,10),COLORWHITE;
        EMA22:EMA(CLOSE,25),COLORYELLOW;
        """,
            "params": [
            ],
            "expected": """
function* FUNC(C){
C.DEFINE({
type: "SUB",
cname: "FUNC",
state: "KLINE",
yaxis: [],
});
let EMA1 = C.OUTS("LINE", "EMA1", {color: WHITE});
let EMA22 = C.OUTS("LINE", "EMA22", {color: YELLOW});
while(true){
let i = yield;
EMA1[i]=EMA(i, C.DS.close, 10, EMA1);
EMA22[i]=EMA(i, C.DS.close, 25, EMA22);
}
}        
         """,
        }

        self.assert_convert(case)

if __name__ == '__main__':
    unittest.main()

