#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "CDP",
            "cname": "逆势操作",
            "type": "MAIN",
            "src": """
        //该模型仅仅用来示范如何根据指标编写简单的模型
        //用户需要根据自己交易经验，进行修改后再实际应用!!!
        // //后为文字说明，编写模型时不用写出
        PT  := REF(HIGH,1)-REF(LOW,1);//求一个周期前的最高价与最低价的差值
        CDP := (REF(HIGH,1) + REF(LOW,1) + REF(CLOSE,1))/3;//求前一个周期的最高价，最低价，收盘价三者的简单平均
        AH  : MA(CDP + PT,N);//CDP与PT的和在N个周期内的简单移动平均
        AL  : MA(CDP - PT,N);//CDP与PT的差在N个周期内的简单移动平均
        NH  : MA(2*CDP-LOW,N);//2倍的CDP与最低价的差在N个周期内的简单移动平均
        NL  : MA(2*CDP-HIGH,N);//2倍的CDP与最高价的差在N个周期内的简单移动平均
        """,
            "params": [
                ("N", 1, 100, 20),
            ],
            "expected": """

function* CDP(C){
C.DEFINE({
type: "MAIN",
cname: "逆势操作",
state: "KLINE",
yaxis: [],
});
//定义指标参数
let N = C.PARAM(20.000000, "N", {"MIN": 1.000000, "MAX":100.000000});
//输入序列
let HIGH = C.SERIAL("HIGH");
let LOW = C.SERIAL("LOW");
let CLOSE = C.SERIAL("CLOSE");
//输出序列
let AH = C.OUTS("LINE", "AH", {color: RED});
let AL = C.OUTS("LINE", "AL", {color: GREEN});
let NH = C.OUTS("LINE", "NH", {color: BLUE});
let NL = C.OUTS("LINE", "NL", {color: CYAN});
//临时序列
let PT = [];
let CDP = [];
let S_1 = [];
let S_2 = [];
let S_3 = [];
let S_4 = [];
//指标计算
while(true){
let i = yield;
PT[i]=REF(i, HIGH, 1) - REF(i, LOW, 1);
CDP[i]=((REF(i, HIGH, 1) + REF(i, LOW, 1)) + REF(i, CLOSE, 1)) / 3;
S_1[i]=CDP[i] + PT[i];
AH[i]=MA(i, S_1, N, AH);
S_2[i]=CDP[i] - PT[i];
AL[i]=MA(i, S_2, N, AL);
S_3[i]=(2 * CDP[i]) - LOW[i];
NH[i]=MA(i, S_3, N, NH);
S_4[i]=(2 * CDP[i]) - HIGH[i];
NL[i]=MA(i, S_4, N, NL);
}
}      
            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
