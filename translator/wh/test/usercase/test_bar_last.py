#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    def test_trade(self):
        case = {'cname': 'yh',
 'id': 'yh',
 'params': [],
 'src': '\r\n'
        '\r\n'
        ' \r\n'
        'HH:=HHV(C,15);\r\n'
        'LL:=LLV(C,15);\r\n'
        'A1:=BARSLAST(C>5);\r\n'
        'HH1:=BARSLAST((HH > REF(HH,1)));\r\n'
        'LL1:=BARSLAST((LL < REF(LL,1)));\r\n'
        'STICKLINE((HH1 < LL1),CLOSE,OPEN,COLORRED,0);\r\n'
        'DRAWLINE((HH1 < LL1),HIGH,(HH1 < LL1),LOW,COLORRED);\r\n'
        'STICKLINE((HH1 > LL1),CLOSE,OPEN,COLORBLUE,0);\r\n'
        'DRAWLINE((HH1 > LL1),HIGH,(HH1 > LL1),LOW,COLORBLUE);\r\n'
        "DRAWTEXT(CROSS(HH1,LL1),HH,'>开空');\r\n"
        "DRAWTEXT(CROSS(LL1,HH1),LL,'开多');\r\n"
        'T:=IFELSE(HH1>LL1,1,-1);\r\n'
        'G:=IFELSE(HH1>LL1,HH,LL);\r\n'
        'DRAWLINE(T=1&&REF(T,1)=1,G,T=1&&REF(T,1)=1,REF(G,1),COLORCYAN);\r\n'
        'DRAWLINE(T=-1&&REF(T,1)=-1,G,T=-1&&REF(T,1)=-1,REF(G,1),COLORRED);\r\n'
        'DRAWSL(T=1,G,0,1,0,COLORCYAN);\r\n'
        'DRAWSL(T=-1,G,0,1,0,COLORRED);\r\n'
        'VARAA:=LLV(LOW,35);\r\n'
        'VARBB:=HHV(HIGH,30);\r\n'
        'VARCC:=EMA((CLOSE-VARAA)/(VARBB-VARAA)*4,4)*25;\r\n'
        'QS:= VARCC,COLORWHITE;\r\n'
        'VARD:=87.5;\r\n'
        'VARE:=(VARCC-LLV(VARCC,4))/(HHV(VARCC,4)-LLV(VARCC,4))*4*25;\r\n'
        "DRAWTEXT(IFELSE(CROSS(QS,VARE) && QS>87,87,0),H,'多减');\r\n"
        "DRAWTEXT(IFELSE(CROSS(VARE,QS) && QS<13,13,0),C,'空减'); \r\n"
        'CROSS(HH1,LL1),SPK;\r\n'
        'CROSS(LL1,HH1),BPK;\r\n'
        'AUTOFILTER;',
 'type': 'SUB',
 'expected': """
 
function* yh(C){
C.DEFINE({
type: "SUB",
cname: "yh",
state: "KLINE",
occycle: 1,
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
let HH = [];
let LL = [];
let A1 = [];
let S_1 = [];
let HH1 = [];
let S_2 = [];
let LL1 = [];
let S_3 = [];
let T = [];
let G = [];
let VARAA = [];
let VARBB = [];
let VARCC = [];
let S_4 = [];
let S_5 = [];
let QS = [];
let VARD = [];
let VARE = [];
//指标计算
while(true){
let i = yield;
HH[i]=HIGHEST(i, CLOSE, 15);
LL[i]=LOWEST(i, CLOSE, 15);
S_1[i]=CLOSE[i] > 5;
A1[i]=(i - NEAREST(i, S_1));
S_2[i]=HH[i] > REF(i, HH, 1);
HH1[i]=(i - NEAREST(i, S_2));
S_3[i]=LL[i] < REF(i, LL, 1);
LL1[i]=(i - NEAREST(i, S_3));
if((HH1[i] < LL1[i]))C.DRAW_PANEL("BAR" + i, i, CLOSE[i], i, OPEN[i], RED);
if((HH1[i] < LL1[i]) && (HH1[i] < LL1[i]))C.DRAW_LINE("LINE" + i, i, HIGH[i], i, LOW[i], RED, 1, 0);
if((HH1[i] > LL1[i]))C.DRAW_PANEL("BAR" + i, i, CLOSE[i], i, OPEN[i], BLUE);
if((HH1[i] > LL1[i]) && (HH1[i] > LL1[i]))C.DRAW_LINE("LINE" + i, i, HIGH[i], i, LOW[i], BLUE, 1, 0);
if((HH1[i] > LL1[i] && HH1[i-1] < LL1[i-1]))C.DRAW_TEXT("TEXT" + i, i, HH[i], '>开空', WHITE);
if((LL1[i] > HH1[i] && LL1[i-1] < HH1[i-1]))C.DRAW_TEXT("TEXT" + i, i, LL[i], '开多', WHITE);
T[i]=((HH1[i] > LL1[i]) ? 1 : (-1));
G[i]=((HH1[i] > LL1[i]) ? HH[i] : LL[i]);
if(((T[i] == 1) && (REF(i, T, 1) == 1)) && ((T[i] == 1) && (REF(i, T, 1) == 1)))C.DRAW_LINE("LINE" + i, i, G[i], i, REF(i, G, 1), CYAN, 1, 0);
if(((T[i] == (-1)) && (REF(i, T, 1) == (-1))) && ((T[i] == (-1)) && (REF(i, T, 1) == (-1))))C.DRAW_LINE("LINE" + i, i, G[i], i, REF(i, G, 1), RED, 1, 0);
if((T[i] == 1))C.DRAW_SEG("LINE" + i, i, G[i], i+1, G[i] + 0, CYAN, 1, 0);
if((T[i] == (-1)))C.DRAW_SEG("LINE" + i, i, G[i], i+1, G[i] + 0, RED, 1, 0);
VARAA[i]=LOWEST(i, LOW, 35);
VARBB[i]=HIGHEST(i, HIGH, 30);
S_4[i]=((CLOSE[i] - VARAA[i]) / (VARBB[i] - VARAA[i])) * 4;
S_5[i]=EMA(i, S_4, 4, S_5);
VARCC[i]=S_5[i] * 25;
QS[i] = VARCC[i];
VARD[i] = 87.5;
VARE[i]=(((VARCC[i] - LOWEST(i, VARCC, 4)) / (HIGHEST(i, VARCC, 4) - LOWEST(i, VARCC, 4))) * 4) * 25;
if((((QS[i] > VARE[i] && QS[i-1] < VARE[i-1]) && (QS[i] > 87)) ? 87 : 0))C.DRAW_TEXT("TEXT" + i, i, HIGH[i], '多减', WHITE);
if((((VARE[i] > QS[i] && VARE[i-1] < QS[i-1]) && (QS[i] < 13)) ? 13 : 0))C.DRAW_TEXT("TEXT" + i, i, CLOSE[i], '空减', WHITE);
if((HH1[i] > LL1[i] && HH1[i-1] < LL1[i-1])) C.ORDER("SELL", "CLOSEOPEN", 1);
if((LL1[i] > HH1[i] && LL1[i-1] < HH1[i-1])) C.ORDER("BUY", "CLOSEOPEN", 1);
}
}        
               
  """
                }

        self.assert_convert(case)

if __name__ == '__main__':
    unittest.main()



 # 'src': '\r\n'
 #        '\r\n'
 #        ' \r\n'
 #        'HH:=HHV(C,15);\r\n'
 #        'LL:=LLV(C,15);\r\n'
 #        'A1:=BARSLAST(C>5);\r\n'
 #        'HH1:=BARSLAST((HH > REF(HH,1)));\r\n'
 #        'LL1:=BARSLAST((LL < REF(LL,1)));\r\n'
 #        'STICKLINE((HH1 < LL1),CLOSE,OPEN,COLORRED,0);\r\n'
 #        'DRAWLINE((HH1 < LL1),HIGH,(HH1 < LL1),LOW,COLORRED);\r\n'
 #        'STICKLINE((HH1 > LL1),CLOSE,OPEN,COLORBLUE,0);\r\n'
 #        'DRAWLINE((HH1 > LL1),HIGH,(HH1 > LL1),LOW,COLORBLUE);\r\n'
 #        "DRAWTEXT(CROSS(HH1,LL1),HH,'>开空');\r\n"
 #        "DRAWTEXT(CROSS(LL1,HH1),LL,'开多');\r\n"
 #        'T:=IFELSE(HH1>LL1,1,-1);\r\n'
 #        'G:=IFELSE(HH1>LL1,HH,LL);\r\n'
 #        'DRAWLINE(T=1&&REF(T,1)=1,G,T=1&&REF(T,1)=1,REF(G,1),COLORCYAN);\r\n'
 #        'DRAWLINE(T=-1&&REF(T,1)=-1,G,T=-1&&REF(T,1)=-1,REF(G,1),COLORRED);\r\n'
 #        'DRAWSL(T=1,G,0,1,0,COLORCYAN);\r\n'
 #        'DRAWSL(T=-1,G,0,1,0,COLORRED);\r\n'
 #        'VARAA:=LLV(LOW,35);\r\n'
 #        'VARBB:=HHV(HIGH,30);\r\n'
 #        'VARCC:=EMA((CLOSE-VARAA)/(VARBB-VARAA)*4,4)*25;\r\n'
 #        'QS:= VARCC,COLORWHITE;\r\n'
 #        'VARD:=87.5;\r\n'
 #        'VARE:=(VARCC-LLV(VARCC,4))/(HHV(VARCC,4)-LLV(VARCC,4))*4*25;\r\n'
 #        "DRAWTEXT(IFELSE(CROSS(QS,VARE) && QS>87,87,0),H,'多减');\r\n"
 #        "DRAWTEXT(IFELSE(CROSS(VARE,QS) && QS<13,13,0),C,'空减'); \r\n"
 #        'CROSS(HH1,LL1),SPK;\r\n'
 #        'CROSS(LL1,HH1),BPK;\r\n'
 #        'AUTOFILTER;',

