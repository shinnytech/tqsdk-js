#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """

    画小圆点线。
    用法：
    CIRCLEDOT 画小圆点线。

    注：
    1、该函数支持设置颜色。
    2、不支持将函数定义为变量，即不支持下面的写法：A:CIRCLEDOT；

    例：MA5:MA(C,5),CIRCLEDOT,COLORCYAN;//用小圆点线画5周期均线，圆点线显示为青色。

    小圆圈线。
    用法：
    CROSSDOT 画小圆圈线。

    注：
    1、该函数支持设置颜色。
    2、不支持将函数定义为变量，即不支持下面的写法：A:CROSSDOT；

    例：MA5:MA(C,5),CROSSDOT,COLORCYAN;//用小圆圈线画5周期均线，圆圈线显示为青色。

    画点虚线。
    用法：
    DASHDOT 画点虚线。

    注：
    1、该函数支持设置颜色。
    2、不支持将函数定义为变量，即不支持下面的写法：A:DASHDOT；

    例：MA5:MA(C,5),DASHDOT,COLORCYAN;//用点虚线画5周期均线，显示为青色。

    画双点虚线。
    用法：
    DASHDOTDOT 画双点虚线。

    注：
    1、该函数支持设置颜色。
    2、不支持将函数定义为变量，即不支持下面的写法：A:DASHDOTDOT；

    例：MA5:MA(C,5),DASHDOTDOT,COLORCYAN;//用双点虚线画5周期均线，显示为青色。

    画点线。
    用法：
    DOT 画点线。
    注：
    不支持将该函数直接定义为变量，即不支持下面的写法：A:DOT;
    例：MA5:MA(C,5),DOT;用点线画5日均线。

    画点线。
    用法：
    POINTDOT 画点线。
    注：
    不支持将该函数直接定义为变量，即不支持下面的写法：A:POINTDOT;
    例：MA5:MA(C,5),POINTDOT;用点线画5日均线。

    """
    def test_trade(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
            MA5:MA(C,5),CIRCLEDOT,COLORCYAN;
        MA5:MA(C,5),POINTDOT;
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
let MA5 = C.OUTS("LINE", "MA5", {color: CYAN, style: PS_DOT});
let MA5 = C.OUTS("LINE", "MA5", {color: GREEN, style: PS_DOT});
while(true){
let i = yield;
MA5[i]=MA(i, C.DS.close, 5, MA5);
MA5[i]=MA(i, C.DS.close, 5, MA5);
}
}        
       
   
         """,
        }

        self.assert_convert(case)

if __name__ == '__main__':
    unittest.main()

