#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "DDI",
            "cname": "方向标准离差",
            "type": "SUB",
            "src": """
        //该模型仅仅用来示范如何根据指标编写简单的模型
        //用户需要根据自己交易经验，进行修改后再实际应用!!!
        // //后为文字说明，编写模型时不用写出
        TR:=MAX(ABS(HIGH-REF(HIGH,1)),ABS(LOW-REF(LOW,1)));//（最高价-前一周期最高价）的绝对值与（最低价-前一周期最低价）的绝对值两者之间较大者定义为TR
        DMZ:=IFELSE((HIGH+LOW)<=(REF(HIGH,1)+REF(LOW,1)),0,MAX(ABS(HIGH-REF(HIGH,1)),ABS(LOW-REF(LOW,1))));//如果（最高价+最低价）<=（前一周期最高价+前一周期最低价），DMZ返回0，否则返回TR
        DMF:=IFELSE((HIGH+LOW)>=(REF(HIGH,1)+REF(LOW,1)),0,MAX(ABS(HIGH-REF(HIGH,1)),ABS(LOW-REF(LOW,1))));//如果（最高价+最低价）>=（前一周期最高价+前一周期最低价），DMF返回0，否则返回TR
        DIZ:=SUM(DMZ,N)/(SUM(DMZ,N)+SUM(DMF,N));//N个周期DMZ之和与（N个周期DMZ的和+N个周期DMF的和）作比值
        DIF:=SUM(DMF,N)/(SUM(DMF,N)+SUM(DMZ,N));//N个周期DMF的和与（N个周期DMF的和+N个周期DMZ的和）作比值
        DDI:=DIZ-DIF;//DIZ与DIF的差值定义为DDI
        DDI,COLORSTICK;
        ADDI:SMA(DDI,N1,M);//DDI在N1个周期内权重为M的加权平均
        AD:MA(ADDI,M1);//ADDI在M1个周期内的简单移动平均
        """,
            "params": [
                ("N", 1, 100, 13),
                ("N1", 1, 100, 30),
                ("M", 1, 100, 10),
                ("M1", 1, 100, 5),
            ],
            "expected": """

function* DDI(C){
C.DEFINE({
type: "SUB",
cname: "方向标准离差",
state: "KLINE",
yaxis: [],
});
let N = C.PARAM(13.000000, "N", {"MIN": 1.000000, "MAX":100.000000});
let N1 = C.PARAM(30.000000, "N1", {"MIN": 1.000000, "MAX":100.000000});
let M = C.PARAM(10.000000, "M", {"MIN": 1.000000, "MAX":100.000000});
let M1 = C.PARAM(5.000000, "M1", {"MIN": 1.000000, "MAX":100.000000});
let S_7 = C.OUTS("RGBAR", "S_7", {color: RED});
let ADDI = C.OUTS("LINE", "ADDI", {color: GREEN});
let AD = C.OUTS("LINE", "AD", {color: BLUE});
let TR = [];
let DMZ = [];
let DMF = [];
let DIZ = [];
let S_1 = [];
let S_2 = [];
let S_3 = [];
let DIF = [];
let S_4 = [];
let S_5 = [];
let S_6 = [];
let DDI = [];
while(true){
let i = yield;
TR[i]=MAX(ABS((C.DS.high[i] - REF(i, C.DS.high, 1))), ABS((C.DS.low[i] - REF(i, C.DS.low, 1))));
DMZ[i]=(((C.DS.high[i] + C.DS.low[i]) <= (REF(i, C.DS.high, 1) + REF(i, C.DS.low, 1))) ? 0 : MAX(ABS((C.DS.high[i] - REF(i, C.DS.high, 1))), ABS((C.DS.low[i] - REF(i, C.DS.low, 1)))));
DMF[i]=(((C.DS.high[i] + C.DS.low[i]) >= (REF(i, C.DS.high, 1) + REF(i, C.DS.low, 1))) ? 0 : MAX(ABS((C.DS.high[i] - REF(i, C.DS.high, 1))), ABS((C.DS.low[i] - REF(i, C.DS.low, 1)))));
S_1[i]=SUM(i, DMZ, N, S_1);
S_2[i]=SUM(i, DMZ, N, S_2);
S_3[i]=SUM(i, DMF, N, S_3);
DIZ[i]=S_1[i] / (S_2[i] + S_3[i]);
S_4[i]=SUM(i, DMF, N, S_4);
S_5[i]=SUM(i, DMF, N, S_5);
S_6[i]=SUM(i, DMZ, N, S_6);
DIF[i]=S_4[i] / (S_5[i] + S_6[i]);
DDI[i]=DIZ[i] - DIF[i];
S_7[i] = DDI[i];
ADDI[i]=SMA(i, DDI, N1, M, ADDI);
AD[i]=MA(i, ADDI, M1, AD);
}
}        
     
   
            
            """,
        }
        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
