#!/usr/bin/env python
# coding=utf-8

import unittest
from wh.test.base import TestConvert


class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {"id": "cctv",
                "cname": "cctv",
                "type": "MAIN",
                "params": [],
                "src": """
                V6:EMA2(CLOSE,60),COLORYELLOW,LINETHICK1;\r\n
                V9:EMA2(CLOSE,90),RGB(0,128,0),LINETHICK1;\r\n
                V18:EMA2(CLOSE,180),COLORRED,LINETHICK1;\r\n
                A:=CROSS(V6,V9);\r\n
                B:=CROSS(V9,V6);\r\n
                DRAWICON(A,V6,4);\r\n
                DRAWICON(B,V9,5);
                """,
                "expected": """
                
function* cctv(C){
C.DEFINE({
type: "MAIN",
cname: "cctv",
state: "KLINE",
yaxis: [],
});
//定义指标参数

//输入序列
let CLOSE = C.SERIAL("CLOSE");
//输出序列
let V6 = C.OUTS("LINE", "V6", {color: YELLOW, width: 1});
let V9 = C.OUTS("LINE", "V9", {color: RGB(0, 128, 0), width: 1});
let V18 = C.OUTS("LINE", "V18", {color: RED, width: 1});
//临时序列
let A = [];
let B = [];
//指标计算
while(true){
let i = yield;
V6[i]=EMA(i, CLOSE, 60, V6);
V9[i]=EMA(i, CLOSE, 90, V9);
V18[i]=EMA(i, CLOSE, 180, V18);
A[i]=(V6[i] > V9[i] && V6[i-1] < V9[i-1]);
B[i]=(V9[i] > V6[i] && V9[i-1] < V6[i-1]);
if(A[i])C.DRAW_ICON("ICON" + i, i, V6[i], ICON_BLOCK);
if(B[i])C.DRAW_ICON("ICON" + i, i, V9[i], ICON_BLOCK);
}
}        
                
                """,
                }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
