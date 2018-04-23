#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    BACKGROUNDSTYLE函数    设置背景的样式。

    用法：
    BACKGROUNDSTYLE(i)设置背景的样式。
    i = 0 或1或2。

    注：
    1.
    0 是保持本身坐标不变。
    1 是将坐标固定在0到100之间。
    2 是将坐标以0为中轴的坐标系。
    2、参数i的选择根据想要显示的指标数据范围而定。
    3、不支持将该函数直接定义为变量，即不支持下面的写法：A:BACKGROUNDSTYLE(i);

    例1：
    MA5:MA(C,5);
    MA10:MA(C,10);
    BACKGROUNDSTYLE(0);
    例2：
    DIFF : EMA(CLOSE,12) - EMA(CLOSE,26);
    DEA  : EMA(DIFF,9);
    2*(DIFF-DEA),COLORSTICK;
    BACKGROUNDSTYLE(2)
    """
    def test_1(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
    DIFF : EMA(CLOSE,12) - EMA(CLOSE,26);
    DEA  : EMA(DIFF,9);
    2*(DIFF-DEA),COLORSTICK;
    BACKGROUNDSTYLE(2);
        """,
            "params": [
            ],
            "expected": """


function* FUNC(C){
C.DEFINE({
type: "SUB",
cname: "FUNC",
state: "KLINE",
yaxis: [{'mid': 0, 'id': 0}],
});
let DIFF = C.OUTS("LINE", "DIFF", {color: RED});
let DEA = C.OUTS("LINE", "DEA", {color: GREEN});
let S_3 = C.OUTS("RGBAR", "S_3", {color: BLUE});
let S_1 = [];
let S_2 = [];
while(true){
let i = yield;
S_1[i]=EMA(i, C.DS.close, 12, S_1);
S_2[i]=EMA(i, C.DS.close, 26, S_2);
DIFF[i]=S_1[i] - S_2[i];
DEA[i]=EMA(i, DIFF, 9, DEA);
S_3[i]=2 * (DIFF[i] - DEA[i]);
}
}        
                      
          """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
