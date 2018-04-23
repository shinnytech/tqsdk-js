#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "PSY",
            "cname": "心理线",
            "type": "SUB",
            "src": """
        //该模型仅仅用来示范如何根据指标编写简单的模型
        //用户需要根据自己交易经验，进行修改后再实际应用!!!
        // //后为文字说明，编写模型时不用写出
        PSY:COUNT(CLOSE>REF(CLOSE,1),N)/N*100;//N个周期内满足收盘价大于一个周期前的收盘价的周期数，比N*100；
        PSYMA:MA(PSY,M);//PSY在M个周期内的简单移动平均；
        """,
            "params": [
                ("N", 2, 100, 12),
                ("M", 2, 100, 6),
            ],
            "expected": """

function* PSY(C){
C.DEFINE({
type: "SUB",
cname: "心理线",
state: "KLINE",
yaxis: [],
});
let N = C.PARAM(12.000000, "N", {"MIN": 2.000000, "MAX":100.000000});
let M = C.PARAM(6.000000, "M", {"MIN": 2.000000, "MAX":100.000000});
let PSY = C.OUTS("LINE", "PSY", {color: RED});
let PSYMA = C.OUTS("LINE", "PSYMA", {color: GREEN});
let S_1 = [];
let S_2 = [];
while(true){
let i = yield;
S_1[i]=C.DS.close[i] > REF(i, C.DS.close, 1);
S_2[i]=COUNT(i, S_1, N, S_2);
PSY[i]=(S_2[i] / N) * 100;
PSYMA[i]=MA(i, PSY, M, PSYMA);
}
}        
       
            """,
        }
        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
