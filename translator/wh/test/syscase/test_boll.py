#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_boll(self):
        case = {
            "id": "BOLL",
            "cname": "布林通道线",
            "type": "MAIN",
            "src": """
        //该模型仅仅用来示范如何根据指标编写简单的模型
        //用户需要根据自己交易经验，进行修改后再实际应用!!!
        // //后为文字说明，编写模型时不用写出
        MID:MA(CLOSE,N);//求N个周期的收盘价均线，称为布林通道中轨
        TMP2:=STD(CLOSE,M);//求M个周期内的收盘价的标准差
        TOP:MID+P*TMP2;//布林通道上轨
        BOTTOM:MID-P*TMP2;//布林通道下轨
        BOTTOM2:MA(MID,N);
        """,
            "params": [
                ("N", 5, 100000, 26),
                ("M", 1, 100000, 26),
                ("P", 1, 10, 2),
            ],
            "expected": """
function* BOLL(C){
C.DEFINE({
type: "MAIN",
cname: "布林通道线",
state: "KLINE",
yaxis: [

],
});
//定义指标参数
let N = C.PARAM(26.000000, "N", {"MIN": 5.000000, "MAX":100000.000000});
let M = C.PARAM(26.000000, "M", {"MIN": 1.000000, "MAX":100000.000000});
let P = C.PARAM(2.000000, "P", {"MIN": 1.000000, "MAX":10.000000});
//输入序列
let CLOSE = C.SERIAL("CLOSE");
//输出序列
let MID = C.OUTS("LINE", "MID", {color: RED});
let TOP = C.OUTS("LINE", "TOP", {color: GREEN});
let BOTTOM = C.OUTS("LINE", "BOTTOM", {color: BLUE});
let BOTTOM2 = C.OUTS("LINE", "BOTTOM2", {color: CYAN});
//临时序列
let TMP2 = [];
//指标计算
while(true){
let i = yield;
MID[i]=MA(i, CLOSE, N, MID);
TMP2[i]=STDEV(i, CLOSE, M, TMP2);
TOP[i]=MID[i] + (P * TMP2[i]);
BOTTOM[i]=MID[i] - (P * TMP2[i]);
BOTTOM2[i]=MA(i, MID, N, BOTTOM2);
}
}        
            """,
        }
        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
