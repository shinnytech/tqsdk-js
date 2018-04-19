#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    ROUND(N,M) 对数字N进行位数为M的四舍五入。

    注：
    1、N支持写为变量和参数；M不支持写为变量，可以写为参数。
    2、M>0，则对数字N小数点后M位小数进行四舍五入。
    3、M=0，则将数字N四舍五入为整数。
    4、M<0，则在数字N小数点左侧前M位进行四舍五入。

    例1：
    ROUND(125.345,2);//返回125.35。
    例2：
    ROUND(125.345,0);//返回125。
    例3：
    ROUND(125.345,-1);//返回130
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
    ROUND(125.345,2);//返回125.35。
    ROUND(125.345,0);//返回125。
    ROUND(125.345,-1);//返回130
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

//输出序列
let S_1 = C.OUTS("LINE", "S_1", {color: RED});
let S_2 = C.OUTS("LINE", "S_2", {color: GREEN});
let S_3 = C.OUTS("LINE", "S_3", {color: BLUE});
//临时序列

//指标计算
while(true){
let i = yield;
S_1[i]=ROUND(125.345, 2);
S_2[i]=ROUND(125.345, 0);
S_3[i]=ROUND(125.345, (-1));
}
}        
            

            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
