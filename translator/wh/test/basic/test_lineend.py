#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    测试行尾
    """
    def test_trade(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
            MA3: MA(C,3)
            MA1: MA(C,1);MA2: MA(C,2);
            MA4: MA(C,4);;;;
            
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
//定义指标参数

//输出序列
let MA3 = C.OUTS("LINE", "MA3", {color: RED});
let MA1 = C.OUTS("LINE", "MA1", {color: GREEN});
let MA2 = C.OUTS("LINE", "MA2", {color: BLUE});
let MA4 = C.OUTS("LINE", "MA4", {color: CYAN});
//临时序列

//指标计算
while(true){
let i = yield;
MA3[i]=MA(i, C.DS.close, 3, MA3);
MA1[i]=MA(i, C.DS.close, 1, MA1);
MA2[i]=MA(i, C.DS.close, 2, MA2);
MA4[i]=MA(i, C.DS.close, 4, MA4);
}
}        
        
   
         """,
        }

        self.assert_convert(case)

if __name__ == '__main__':
    unittest.main()

