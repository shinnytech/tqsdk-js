#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert


class TestConvertIndicator(TestConvert):
    """
    DRAWLINE 绘制直线段。

    用法：
    DRAWLINE(C1,P1,C2,P2,COLOR);
    满足条件C1时及C2时从P1向P2画线。颜色为COLOR。

    注：
    1、画线所在的k线须C1、C2同时满足。
    2、绘制的直线段是在满足的k线上从P1到P2位置画COLOR颜色的线段。
    3、该函数支持在函数后设置线型（LINETHICK1 - LINETHICK7、POINTDOT、DOT），即支持下面的写法：
    DRAWLINE(C1,P1,C2,P2,COLOR),LINETHICK;
    4、不支持将该函数定义为变量，即不支持下面的写法：
    A:DRAWLINE(C1,P1,C2,P2,COLOR);

    例1：
    MA5:=MA(C,5);
    MA10:=MA(C,10);
    DRAWLINE(MA10<CLOSE,OPEN,MA5>CLOSE,CLOSE,COLORCYAN);//表示当收盘价大于10日均线并且小于5日均线时，从开盘价画青色直线到收盘价。
    例2：
    DRAWLINE(ISUP,C,ISUP,H,COLORRED),LINETHICK7;//表示当前k线收阳时，从收盘价价画红色直线到最高价，线型粗细为7。
    """
    def test_func(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
    MA5:=MA(C,5);
    MA10:=MA(C,10);
    DRAWLINE(MA10<CLOSE,OPEN,MA5>CLOSE,CLOSE,COLORCYAN);//表示当收盘价大于10日均线并且小于5日均线时，从开盘价画青色直线到收盘价。
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
let CLOSE = C.SERIAL("CLOSE");
let OPEN = C.SERIAL("OPEN");
//输出序列

//临时序列
let MA5 = [];
let MA10 = [];
//指标计算
while(true){
let i = yield;
MA5[i]=MA(i, CLOSE, 5, MA5);
MA10[i]=MA(i, CLOSE, 10, MA10);
if((MA10[i] < CLOSE[i]) && (MA5[i] > CLOSE[i]))C.DRAW_LINE("LINE" + i, i, OPEN[i], i, CLOSE[i], CYAN, 1, 0);
}
}        
     
                 """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
