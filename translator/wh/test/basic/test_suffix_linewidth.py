#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """序列尾部使用线宽定义符"""
    def test_1(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
            V6:MA(CLOSE,60),LINETHICK3;
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
let V6 = C.OUTS("LINE", "V6", {color: RED, width: 3});
//临时序列

//指标计算
while(true){
let i = yield;
V6[i]=MA(i, C.DS.close, 60, V6);
}
}        
    
             """,
        }

        self.assert_convert(case)

if __name__ == '__main__':
    unittest.main()

