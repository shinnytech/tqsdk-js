#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    DRAWSL 绘制直线（段）。

    用法：
    da(COND,DATA,SLOPE,LEN,EXPAND,COLOR);
    当条件COND满足时，在DATA数据处以每个周期相差SLOPE个价位作为斜率画LEN个周期长的线段。
    EXPAND为画线延长方式0:不延伸；1:向左延伸；2:向右延伸；3:双向延伸。

    注：
    1、每根k线与每根k线（每个周期）的纵向高度差为SLOPE。
    2、当SLOPE为0时,画的是水平线。
    3、该函数支持在函数后设置线型（LINETHICK1 - LINETHICK7、POINTDOT、DOT），即支持下面的写法：
    DRAWSL(COND,DATA,SLOPE,LEN,EXPAND,COLOR),LINETHICK;
    4、不支持将该函数定义为变量，即不支持下面的写法：
    A:DRAWSL(COND,DATA,SLOPE,LEN,EXPAND,COLOR);

    例1：
    DRAWSL(C>O,H,0,2,0,COLORYELLOW);//表示当前k线为阳线时，从最高价开始画长度为2个周期的水平线，颜色为黄色。

    例2：
    DRAWSL(LOW=LLV(LOW,50),LOW,5,3,2,COLORRED),LINETHICK5;//表示当前最低价等于50周期内的最小值时，从当前最低价开始以每隔5个点的斜率画长度为3个周期向右延伸的斜线，颜色为红色，线型粗细为5。

    方案:
        协议中必须增加一种特殊序列, 接收方处理有困难, 需重构
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
        DRAWSL(C>O,H,0,2,0,COLORYELLOW);//表示当前k线为阳线时，从最高价开始画长度为2个周期的水平线，颜色为黄色。
        DRAWSL(LOW=LLV(LOW,50),LOW,5,3,2,COLORRED),LINETHICK5;//表示当前最低价等于50周期内的最小值时，从当前最低价开始以每隔5个点的斜率画长度为3个周期向右延伸的斜线，颜色为红色，线型粗细为5。
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
let HIGH = C.SERIAL("HIGH");
let LOW = C.SERIAL("LOW");
//输出序列

//临时序列

//指标计算
while(true){
let i = yield;
if((CLOSE[i] > OPEN[i]))C.DRAW_SEG("LINE" + i, i, HIGH[i], i+2, HIGH[i] + 0, YELLOW, 1, 0);
if((LOW[i] == LOWEST(i, LOW, 50)))C.DRAW_RAY("LINE" + i, i, LOW[i], i+3, LOW[i] + 5, RED, 5, 0);
}
}        
   
            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
