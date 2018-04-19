#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "DMI",
            "cname": "趋向指标",
            "type": "SUB",
            "src": """
            //该模型仅仅用来示范如何根据指标编写简单的模型
            //用户需要根据自己交易经验，进行修改后再实际应用!!!
            // //后为文字说明，编写模型时不用写出
            TR := SUM(MAX(MAX(HIGH-LOW,ABS(HIGH-REF(CLOSE,1))),ABS(LOW-REF(CLOSE,1))),N);//最高价与最低价做差，最高价与前一周期收盘价做差，最低价与前一周期收盘价作差，在上述三个数据中取绝对值最大者，对该最大值做N周期累加求和。。
            HD := HIGH-REF(HIGH,1);//最高价与前一周期最高价做差
            LD := REF(LOW,1)-LOW;//前一周期最低价与最低价做差
            DMP:= SUM(IFELSE(HD>0 && HD>LD,HD,0),N);//如果HD>0并且HD>LD,取HD否则取0,对取值做N周期累加求和。
            DMM:= SUM(IFELSE(LD>0 && LD>HD,LD,0),N);//如果LD>0并且LD>HD,取LD否则取0,对取值做N周期累加求和。
            PDI: DMP*100/TR;
            MDI: DMM*100/TR;
            ADX: MA(ABS(MDI-PDI)/(MDI+PDI)*100,M);//MDI与PDI差的绝对值与(MDI+PDI)*100做比值，取该比值的M个周期均值。
            ADXR:(ADX+REF(ADX,M))/2;
            BACKGROUNDSTYLE(1);
            """,
            "params": [
                ("N", 1, 100, 14),
                ("M", 1, 100, 6),
                ("N0", 1, 100, 20),
                ("M0", 1, 100, 20),
            ],
            "expected": """

function* DMI(C){
C.DEFINE({
type: "SUB",
cname: "趋向指标",
state: "KLINE",
yaxis: [{'min': 0, 'max': 100, 'id': 0}],
});
//定义指标参数
let N = C.PARAM(14.000000, "N", {"MIN": 1.000000, "MAX":100.000000});
let M = C.PARAM(6.000000, "M", {"MIN": 1.000000, "MAX":100.000000});
let N0 = C.PARAM(20.000000, "N0", {"MIN": 1.000000, "MAX":100.000000});
let M0 = C.PARAM(20.000000, "M0", {"MIN": 1.000000, "MAX":100.000000});
//输入序列
let HIGH = C.SERIAL("HIGH");
let LOW = C.SERIAL("LOW");
let CLOSE = C.SERIAL("CLOSE");
//输出序列
let PDI = C.OUTS("LINE", "PDI", {color: RED});
let MDI = C.OUTS("LINE", "MDI", {color: GREEN});
let ADX = C.OUTS("LINE", "ADX", {color: BLUE});
let ADXR = C.OUTS("LINE", "ADXR", {color: CYAN});
//临时序列
let TR = [];
let S_1 = [];
let HD = [];
let LD = [];
let DMP = [];
let S_2 = [];
let DMM = [];
let S_3 = [];
let S_4 = [];
//指标计算
while(true){
let i = yield;
S_1[i]=MAX(MAX((HIGH[i] - LOW[i]), ABS((HIGH[i] - REF(i, CLOSE, 1)))), ABS((LOW[i] - REF(i, CLOSE, 1))));
TR[i]=SUM(i, S_1, N, TR);
HD[i]=HIGH[i] - REF(i, HIGH, 1);
LD[i]=REF(i, LOW, 1) - LOW[i];
S_2[i]=(((HD[i] > 0) && (HD[i] > LD[i])) ? HD[i] : 0);
DMP[i]=SUM(i, S_2, N, DMP);
S_3[i]=(((LD[i] > 0) && (LD[i] > HD[i])) ? LD[i] : 0);
DMM[i]=SUM(i, S_3, N, DMM);
PDI[i]=(DMP[i] * 100) / TR[i];
MDI[i]=(DMM[i] * 100) / TR[i];
S_4[i]=(ABS((MDI[i] - PDI[i])) / (MDI[i] + PDI[i])) * 100;
ADX[i]=MA(i, S_4, M, ADX);
ADXR[i]=(ADX[i] + REF(i, ADX, M)) / 2;
}
}        
           
           """,
        }
        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
