#!/usr/bin/env python
#coding=utf-8

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
    """,
}
