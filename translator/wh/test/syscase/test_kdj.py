#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert


class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "KDJ",
            "cname": "KDJ",
            "type": "SUB",
            "src": """
        //该模型仅仅用来示范如何根据指标编写简单的模型
        //用户需要根据自己交易经验，进行修改后再实际应用!!!
        // //后为文字说明，编写模型时不用写出
        RSV:=(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N))*100;//收盘价与N周期最低值做差，N周期最高值与N周期最低值做差，两差之间做比值。
        K:SMA(RSV,M1,1);//RSV的移动平均值
        D:SMA(K,M2,1);//K的移动平均值
        J:3*K-2*D;
        BACKGROUNDSTYLE(1);
        """,
            "params": [
                ("N", 1, 100, 9),
                ("M1", 2, 100, 3),
                ("M2", 2, 100, 3),
            ],
            "expected": """

function* KDJ(C){
C.DEFINE({
type: "SUB",
cname: "KDJ",
state: "KLINE",
yaxis: [{'min': 0, 'max': 100, 'id': 0}],
});
let N = C.PARAM(9.000000, "N", {"MIN": 1.000000, "MAX":100.000000});
let M1 = C.PARAM(3.000000, "M1", {"MIN": 2.000000, "MAX":100.000000});
let M2 = C.PARAM(3.000000, "M2", {"MIN": 2.000000, "MAX":100.000000});
let K = C.OUTS("LINE", "K", {color: RED});
let D = C.OUTS("LINE", "D", {color: GREEN});
let J = C.OUTS("LINE", "J", {color: BLUE});
let RSV = [];
while(true){
let i = yield;
RSV[i]=((C.DS.close[i] - LOWEST(i, C.DS.low, N)) / (HIGHEST(i, C.DS.high, N) - LOWEST(i, C.DS.low, N))) * 100;
K[i]=SMA(i, RSV, M1, 1, K);
D[i]=SMA(i, K, M2, 1, D);
J[i]=(3 * K[i]) - (2 * D[i]);
}
}                    
           """,
        }
        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
