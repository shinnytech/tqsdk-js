#!/usr/bin/env python
#coding=utf-8

case = {
    "id": "CDP",
    "cname": "逆势操作",
    "type": "MAIN",
    "src": """
//该模型仅仅用来示范如何根据指标编写简单的模型
//用户需要根据自己交易经验，进行修改后再实际应用!!!
// //后为文字说明，编写模型时不用写出
PT  := REF(HIGH,1)-REF(LOW,1);//求一个周期前的最高价与最低价的差值
CDP := (REF(HIGH,1) + REF(LOW,1) + REF(CLOSE,1))/3;//求前一个周期的最高价，最低价，收盘价三者的简单平均
AH  : MA(CDP + PT,N);//CDP与PT的和在N个周期内的简单移动平均
AL  : MA(CDP - PT,N);//CDP与PT的差在N个周期内的简单移动平均
NH  : MA(2*CDP-LOW,N);//2倍的CDP与最低价的差在N个周期内的简单移动平均
NL  : MA(2*CDP-HIGH,N);//2倍的CDP与最高价的差在N个周期内的简单移动平均
""",
    "params": [
        ("N", 1, 100, 20),
    ],
    "expected": """
function* CDP(C){
C.DEFINE({
type: "MAIN",
cname: "逆势操作",
state: "KLINE",
});
//定义指标参数
let N = C.PARAM(20.000000, "N", {"MIN": 1.000000, "MAX":100.000000});
//输入序列
let HIGH = C.SERIAL("HIGH");
let LOW = C.SERIAL("LOW");
let CLOSE = C.SERIAL("CLOSE");
//输出序列
let AH = C.OUTS("LINE", "AH", {color: RED});
let AL = C.OUTS("LINE", "AL", {color: RED});
let NH = C.OUTS("LINE", "NH", {color: RED});
let NL = C.OUTS("LINE", "NL", {color: RED});
//临时序列
let S_1 = [];
let S_2 = [];
let S_3 = [];
let PT = [];
let S_4 = [];
let S_5 = [];
let S_6 = [];
let S_7 = [];
let CDP = [];
let S_8 = [];
let S_9 = [];
let S_10 = [];
let S_11 = [];
let S_12 = [];
let S_13 = [];
let S_14 = [];
let S_15 = [];
let S_16 = [];
let S_17 = [];
//指标计算
while(true){
let i = yield;
S_1[i]=REF(i, HIGH,1, S_1);
S_2[i]=REF(i, LOW,1, S_2);
S_3[i]=((S_1[i] - S_2[i]));
PT[i] = S_3[i];
S_4[i]=((S_1[i] + S_2[i]));
S_5[i]=REF(i, CLOSE,1, S_5);
S_6[i]=((S_4[i] + S_5[i]));
S_7[i]=(((S_6)[i] / 3));
CDP[i] = S_7[i];
S_8[i]=((CDP[i] + PT[i]));
S_9[i]=MA(i, S_8,N, S_9);
AH[i] = S_9[i];
S_10[i]=((CDP[i] - PT[i]));
S_11[i]=MA(i, S_10,N, S_11);
AL[i] = S_11[i];
S_12[i]=((2 * CDP[i]));
S_13[i]=((S_12[i] - LOW[i]));
S_14[i]=MA(i, S_13,N, S_14);
NH[i] = S_14[i];
S_15[i]=((2 * CDP[i]));
S_16[i]=((S_15[i] - HIGH[i]));
S_17[i]=MA(i, S_16,N, S_17);
NL[i] = S_17[i];
}
}        
    """,
}
