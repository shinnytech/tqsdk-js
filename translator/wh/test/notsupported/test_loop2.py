#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    LOOP2(COND,A,B);循环条件函数 若COND条件成立，则返回A，否则返回B

    注：
    1、COND是判断条件;A、B可以是条件，也可以是数值。
    2、该函数支持变量循环引用前一周期自身变量，即支持下面这样的写法Y: LOOP2(CON,X,REF(Y,1));

    例1：
    X:  LOOP2(ISUP,H,REF(X,1));//k线为阳线，取当根K线的最高价，否则取上一次是阳线的K线的最高价;若之前未出现过阳线时，X返回为空值

    例2：
    BB:LOOP2(BARSBK=1,LOOP2(L>LV(L,4),L,LV(L,4)),LOOP2(L>REF(BB,1),L,REF(BB,1)));//持有多单时，开多单那根的前面4个周期内的最低价为起始止损点BB，后续K线最低价比前一个最低价高，取当前最低价为止损点，否则取前一个低点为止损点，
    SS:LOOP2(BARSSK=1,LOOP2(H<HV(H,4),H,HV(H,4)),LOOP2(H<REF(SS,1),H,REF(SS,1)));//持有空单时，开空单那根的前面4个周期内的最高价为起始止损点SS，最高价比前一个最高价低，取当前最高价为止损点，否则取前一个高点为止损点
    H>HV(H,20),BK;
    L<LV(L,20),SK;
    C<BB,SP;
    C>SS,BP;
    AUTOFILTER;
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
    X:  LOOP2(ISUP,H,REF(X,1));//k线为阳线，取当根K线的最高价，否则取上一次是阳线的K线的最高价;若之前未出现过阳线时，X返回为空值
        """,
            "params": [
            ],
            "expected": """
            

            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
