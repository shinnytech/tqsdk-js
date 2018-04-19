#!/usr/bin/env python
#coding=utf-8


#还未支持 DRAWCOLORLINE

case = {
    "id": "_TR004",
    "cname": "_TR004",
    "type": "SUB",
    "src": """
//原理力量对弈的角度
MM..MONEYTOT;
TR := MAX(MAX((HIGH-LOW),ABS(REF(CLOSE,1)-HIGH)),ABS(REF(CLOSE,1)-LOW));
//求最高价减去最低价，一个周期前的收盘价减去最高价的绝对值，一个周期前的收盘价减去最低价的绝对值，这三个值中的最大值
ATR : =MA(TR,20),COLORYELLOW;//求N个周期内的TR的简单移动平均
MA1:EMA(C,N1);
BK1:=TR>3*ATR;
BK2:=C-O>1.5*ATR&&C>MA1;
BK1&&BK2,BK;
SP1:=C<MA1;
SP2:=TR>3*ATR&&C-O<ATR;
SP3:=C<REF(O,BARSBK);
SP1||SP2||SP3,SP;

SK1:=TR>3*ATR;
SK2:=O-C>ATR&&C<MA1;
SK1&&SK2,SK;
BP1:=C>MA1;
BP2:=TR>2*ATR&&C-O>ATR;
BP3:=C>REF(O,BARSSK);
BP1||BP2||BP3,BP;


CLOSEKLINE(2,30);
//每根K线提前30秒走完
SETALLSIGPRICETYPE(TRACING_ORDER);//委托没有成交的时候自动追价
TRADE_OTHER('AUTO');//自动切换合约
AUTOFILTER;
""",
    "params": [
    ],
    "expected": """
    """,
}
