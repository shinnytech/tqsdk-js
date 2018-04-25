#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    BARSLAST(COND)：上一次条件COND成立到当前的周期数

    注：
    1、条件成立的当根k线上BARSLAST(COND)的返回值为0

    例1：
    BARSLAST(OPEN>CLOSE); //上一根阴线到现在的周期数。
    例2：
    N:=BARSLAST(DATE<>REF(DATE,1))+1;//分钟周期，当日k线数。
    //由于条件成立的当根k线上BARSLAST(COND)
    如果条件不成立, 会返回NAN

    方案:
        在js端做一个等价函数
    """
    def test_barlast(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
        BARSLAST(OPEN>CLOSE);
        N:=BARSLAST(DATE<>REF(DATE,1))+1;
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
let S_1 = C.OUTS("LINE", "S_1", {color: RED});
let S_2 = [];
let N = [];
let S_3 = [];
let S_4 = [];
while(true){
let i = yield;
S_2[i]=C.DS.open[i] > C.DS.close[i];
S_1[i]=(i - NEAREST(i, S_2));
S_4[i]=DATE(C.DS[i].datetime);
S_3[i]=DATE(C.DS[i].datetime) != REF(i, S_4, 1);
N[i]=(i - NEAREST(i, S_3)) + 1;
}
}        
            
   

            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
