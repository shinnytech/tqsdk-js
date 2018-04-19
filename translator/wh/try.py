#!/usr/bin/env python
#coding=utf-8

import wh
import wh.whlex

import json
s ={"id":"cde","cname":"cde","type":"SUB","params":[],"src":"//该模型仅仅用来示范如何根据指标编写简单的模型\r\n//用户需要根据自己交易经验，进行修改后再实际应用!!!\r\n// //后为文字说明，>编写模型时不用写出\r\nLC:=REF(CLOSE,1);//一个周期前的收盘价\r\nAA:=ABS(HIGH-LC);//最高价与一个周期前的收盘价的差值的绝对值\r\nBB:=ABS(LOW-LC);//最低价与一个周期前的收盘价的差值的绝对值\r\nCC:=ABS(HIGH-REF(LOW,1));//最高价与一个周期前的最低价的差值的绝对值\r\nDD:=ABS(LC-REF(OPEN,1));//一个周期前的收盘价与一个周期前的开盘价的差值的绝对值\r\nR:=IFELSE(AA>BB&&AA>CC,AA+BB/2+DD/4,IFELSE(BB>CC&&BB>AA,BB+AA/2+DD/4,CC+DD/4));//如果AA>BB&&AA>CC,R取值为AA+BB/2+DD/4,如果BB>CC&&BB>AA,R取值为BB+AA/2+DD/4,否则R取值为CC+DD/4\r\nX:=(CLOSE-LC+(CLOSE-OPEN)/2+LC-REF(OPEN,1));//最新价减去一个周期前的收盘价加上开盘价与最新价的二分之一，再加上一个周期前的收盘价与开盘价的差值\r\nSI:=16*X/R*MAX(AA,BB);\r\nASI:SUM(SI,0)//从本地数据第一个数据开始求SI的总和"}

# print(s["src"])

import pprint

# Prints the nicely formatted dictionary
pprint.pprint(s, compact=True)

# Sets 'pretty_dict_str' to
# pretty_dict_str = pprint.pformat(dictionary)