#!/usr/bin/env python
#coding=utf-8

import wh
import wh.whlex

import json
s ={"id":"qq","cname":"qq","type":"MAIN","params":[],"src":"//该策略为趋势跟踪交易策略，适用较大周期，如日线。\r\n//该模型仅用作模型开发案例，依此入市，风险自负。\r\n////////////////////////////////////////////////////////\r\nMOMVALUE:=C-REF(C,MOMLEN);\r\nVWM:=EMA(VOL*MOMVALUE,AVGLEN);//定义成交量加权为VWM\r\nTRUEHIGH1:=IF(HIGH>REF(C,1),HIGH,REF(C,1));\r\nTRUELOW1:=IF(LOW<=REF(C,1),LOW,REF(C,1));\r\nTRUERANGE1:=IF(ISLASTBAR,H-L,TRUEHIGH1-TRUELOW1);\r\nAATR:=MA(TRUERANGE1,ATRLEN);//定义波动率\t\t\t\t\t   \t\t\t\r\nBULLSETUP:=CROSSUP(VWM,0);//UWM上穿零轴定义多头势\r\nBEARSETUP:=CROSSDOWN(VWM,0);//UWM下穿零轴定义空头势\r\nLSETUP:=LOOP2(BARPOS=1||BULLSETUP,0,REF(LSETUP,1)+1);//多头势开始计数并记录当前价格\r\nLEPRICE:=VALUEWHEN(BULLSETUP,C);\r\nSSETUP:=LOOP2(BARPOS=1||BEARSETUP,0,REF(SSETUP,1)+1);//空头势开始计数并记录当前价格\r\nSEPRICE:=VALUEWHEN(BEARSETUP,C);\r\n//系统入场\r\n//当多头势满足并且在SETUPLEN的BAR数目内,当价格达到入场价格后,做多\r\nBARPOS>AVGLEN&&H>=REF(LEPRICE,1)+(ATRPCNT*REF(AATR,1))&&REF(LSETUP,1)<=SETUPLEN&&LSETUP>=1,BK;\r\n//系统出场\r\nBEARSETUP,SP;\r\n//系统入场\r\n//当空头势满足并且在SETUPLEN的BAR数目内,当价格达到入场价格后,做空\r\nBARPOS>AVGLEN&&L<=REF(SEPRICE,1)-(ATRPCNT*REF(AATR,1))&&REF(SSETUP,1)<=SETUPLEN&&SSETUP>=1,SK;\r\n//系统出场\r\nBULLSETUP,BP;\r\nAUTOFILTER;\r\n\t"}
# print(s["src"])

import pprint

# Prints the nicely formatted dictionary
pprint.pprint(s, compact=True)

# Sets 'pretty_dict_str' to
# pretty_dict_str = pprint.pformat(dictionary)