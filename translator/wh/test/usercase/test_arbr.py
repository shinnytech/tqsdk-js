#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {'cname': 'cde',
 'id': 'cde',
 'params': [],
 'src': '//该模型仅仅用来示范如何根据指标编写简单的模型\r\n'
        '//用户需要根据自己交易经验，进行修改后再实际应用!!!\r\n'
        '// //后为文字说明，>编写模型时不用写出\r\n'
        'LC:=REF(CLOSE,1);//一个周期前的收盘价\r\n'
        'AA:=ABS(HIGH-LC);//最高价与一个周期前的收盘价的差值的绝对值\r\n'
        'BB:=ABS(LOW-LC);//最低价与一个周期前的收盘价的差值的绝对值\r\n'
        'CC:=ABS(HIGH-REF(LOW,1));//最高价与一个周期前的最低价的差值的绝对值\r\n'
        'DD:=ABS(LC-REF(OPEN,1));//一个周期前的收盘价与一个周期前的开盘价的差值的绝对值\r\n'
        'R:=IFELSE(AA>BB&&AA>CC,AA+BB/2+DD/4,IFELSE(BB>CC&&BB>AA,BB+AA/2+DD/4,CC+DD/4));//如果AA>BB&&AA>CC,R取值为AA+BB/2+DD/4,如果BB>CC&&BB>AA,R取值为BB+AA/2+DD/4,否则R取值为CC+DD/4\r\n'
        'X:=(CLOSE-LC+(CLOSE-OPEN)/2+LC-REF(OPEN,1));//最新价减去一个周期前的收盘价加上开盘价与最新价的二分之一，再加上一个周期前的收盘价与开盘价的差值\r\n'
        'SI:=16*X/R*MAX(AA,BB);\r\n'
        'ASI:SUM(SI,0);//从本地数据第一个数据开始求SI的总和',
 'type': 'SUB',
 "expected": """ 

function* cde(C){
C.DEFINE({
type: "SUB",
cname: "cde",
state: "KLINE",
yaxis: [],
});
//定义指标参数

//输入序列
let CLOSE = C.SERIAL("CLOSE");
let HIGH = C.SERIAL("HIGH");
let LOW = C.SERIAL("LOW");
let OPEN = C.SERIAL("OPEN");
//输出序列
let ASI = C.OUTS("LINE", "ASI", {color: RED});
//临时序列
let LC = [];
let AA = [];
let BB = [];
let CC = [];
let DD = [];
let R = [];
let X = [];
let SI = [];
//指标计算
while(true){
let i = yield;
LC[i]=REF(i, CLOSE, 1);
AA[i]=ABS((HIGH[i] - LC[i]));
BB[i]=ABS((LOW[i] - LC[i]));
CC[i]=ABS((HIGH[i] - REF(i, LOW, 1)));
DD[i]=ABS((LC[i] - REF(i, OPEN, 1)));
R[i]=(((AA[i] > BB[i]) && (AA[i] > CC[i])) ? ((AA[i] + (BB[i] / 2)) + (DD[i] / 4)) : (((BB[i] > CC[i]) && (BB[i] > AA[i])) ? ((BB[i] + (AA[i] / 2)) + (DD[i] / 4)) : (CC[i] + (DD[i] / 4))));
X[i]=(((CLOSE[i] - LC[i]) + ((CLOSE[i] - OPEN[i]) / 2)) + LC[i]) - REF(i, OPEN, 1);
SI[i]=((16 * X[i]) / R[i]) * MAX(AA[i], BB[i]);
ASI[i]=SUM(i, SI, 100, ASI);
}
}        
          
 """
 }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
