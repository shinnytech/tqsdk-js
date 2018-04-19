#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    ISLASTBAR 判断该周期是否为最后一根k线

    例1：
    VALUEWHEN(ISLASTBAR=1,REF(H,1));//当前k线是最后一根k线，则取前一周期的最高价。
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
            ISLASTBAR;
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

//输入序列

//输出序列
let S_1 = C.OUTS("LINE", "S_1", {color: RED});
//临时序列

//指标计算
while(true){
let i = yield;
S_1[i]=ISLASTBAR(i);
}
}        
                   

            """,
        }
        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
