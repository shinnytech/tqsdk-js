#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    EVERY(COND,N)，判断N周期内，是否一直满足COND条件。若满足函数返回值为1，不满足函数返回值为0；

    注：
    1、N包含当前k线。
    2、若N是有效数值，但前面没有那么多K线,或者N为空值，代表条件不满足，函数返回值为0。
    3、N可以是变量

    例1：
    EVERY(CLOSE>OPEN,5);//表示5个周期内一直是阳线
    例2：
    MA5:=MA(C,5);//定义5周期均线
    MA10:=MA(C,10);//定义10周期均线
    EVERY(MA5>MA10,4),BK;//4个周期内MA5都大于MA10，则买开仓。
    //EVERY(MA5>MA10,4),BK;   与   EVERY(MA5>MA10,4)=1,BK;    表达同等意义
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
        EVERY(CLOSE>OPEN,5);//表示5个周期内一直是阳线
        MA5:=MA(C,5);//定义5周期均线
        MA10:=MA(C,10);//定义10周期均线
        EVERY(MA5>MA10,4),BK;//4个周期内MA5都大于MA10，则买开仓。
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

let S_1 = C.OUTS("LINE", "S_1", {color: RED});
let S_2 = [];
let MA5 = [];
let MA10 = [];
let S_3 = [];
while(true){
let i = yield;
S_2[i]=C.DS.close[i] > C.DS.open[i];
S_1[i]=EVERY(i, S_2, 5);
MA5[i]=MA(i, C.DS.close, 5, MA5);
MA10[i]=MA(i, C.DS.close, 10, MA10);
S_3[i]=MA5[i] > MA10[i];
if(EVERY(i, S_3, 4)) C.ORDER(i, "BUY", "OPEN", 1);
}
}        
             
                """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
