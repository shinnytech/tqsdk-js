#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert


class TestConvertIndicator(TestConvert):
    def test_dmi(self):
        case = {
            "id": "ADTM",
            "cname": "动态买卖气指标",
            "type": "SUB",
            "src": """
            //该模型仅仅用来示范如何根据指标编写简单的模型
            //用户需要根据自己交易经验，进行修改后再实际应用!!!
            // //后为文字说明，编写模型时不用写出
            DTM:=IFELSE(OPEN<=REF(OPEN,1),0,MAX((HIGH-OPEN),(OPEN-REF(OPEN,1))));//如果开盘价小于等于一个周期前的开盘价，DTM取值为0，否则取最高价减去开盘价和开盘价减去前一个周期开盘价这两个差值中的最大值
            DBM:=IFELSE(OPEN>=REF(OPEN,1),0,MAX((OPEN-LOW),(OPEN-REF(OPEN,1))));//如果开盘价大于等于一个周期前的开盘价，DBM取值为0，否则取开盘价减去最低价和开盘价减去前一个周期开盘价这两个差值中的最大值
            STM:=SUM(DTM,N);//求N个周期内的DTM的总和
            SBM:=SUM(DBM,N);//求N个周期内的DBM的总和
            ADTM:IFELSE(STM>SBM,(STM-SBM)/STM,IFELSE(STM=SBM,0,(STM-SBM)/SBM));//如果STM大于SBM，ADTM取值为(STM-SBM)/STM，如果STM等于SBM，ADTM取值为0,如果STM小于SBM，ADTM取值为(STM-SBM)/SBM
            ADTMMA:MA(ADTM,M);//求M个周期内的ADTM的简单移动平均
            """,
            "params": [
                ("N", 1, 100, 23),
                ("M", 1, 100, 8),
            ],
            "expected": """

function* ADTM(C){
C.DEFINE({
type: "SUB",
cname: "动态买卖气指标",
state: "KLINE",
yaxis: [],
});
let N = C.PARAM(23.000000, "N", {"MIN": 1.000000, "MAX":100.000000});
let M = C.PARAM(8.000000, "M", {"MIN": 1.000000, "MAX":100.000000});
let ADTM = C.OUTS("LINE", "ADTM", {color: RED});
let ADTMMA = C.OUTS("LINE", "ADTMMA", {color: GREEN});
let DTM = [];
let DBM = [];
let STM = [];
let SBM = [];
while(true){
let i = yield;
DTM[i]=((C.DS.open[i] <= REF(i, C.DS.open, 1)) ? 0 : MAX((C.DS.high[i] - C.DS.open[i]), (C.DS.open[i] - REF(i, C.DS.open, 1))));
DBM[i]=((C.DS.open[i] >= REF(i, C.DS.open, 1)) ? 0 : MAX((C.DS.open[i] - C.DS.low[i]), (C.DS.open[i] - REF(i, C.DS.open, 1))));
STM[i]=SUM(i, DTM, N, STM);
SBM[i]=SUM(i, DBM, N, SBM);
ADTM[i]=((STM[i] > SBM[i]) ? ((STM[i] - SBM[i]) / STM[i]) : ((STM[i] == SBM[i]) ? 0 : ((STM[i] - SBM[i]) / SBM[i])));
ADTMMA[i]=MA(i, ADTM, M, ADTMMA);
}
}        
      
     
             """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
