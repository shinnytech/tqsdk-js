#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    STICKLINE 在图形上画柱线。

    用法：
    STICKLINE(COND,P1,P2,Color,Empty);
    当COND条件满足时，从P1到P2画柱,颜色为Color。若Empty不为0，则为空心柱；Empty为0，则为实心柱，其中Empty不支持设置为变量。

    注：
    不支持将该函数定义为变量，即不支持下面的写法：
    A:STICKLINE(COND,P1,P2,Color,Empty);

    例1：
    STICKLINE(OPEN-CLOSE>0,OPEN,CLOSE,COLORCYAN,0);//表示当开盘价大于收盘价时，从开盘价到收盘价画青色的实心柱，即K线阴线的实体部分。
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
            STICKLINE(OPEN-CLOSE>0,OPEN,CLOSE,COLORCYAN,0);//表示当开盘价大于收盘价时，从开盘价到收盘价画青色的实心柱，即K线阴线的实体部分。
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
while(true){
let i = yield;
if(((C.DS.open[i] - C.DS.close[i]) > 0))C.DRAW_PANEL("BAR" + i, i, C.DS.open[i], i, C.DS.close[i], CYAN);
}
}        
    
            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
