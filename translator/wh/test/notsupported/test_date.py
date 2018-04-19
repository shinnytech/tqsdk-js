#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    DATE,返回某周期的日期数。

    注：
    1：DATE的取值范围为700101-331231(即1970年1月1日—2033年12月31日)。
    2：DATE返回六位数字，YYMMDD，
    3：DATE支持上海夜盘的使用，例如：2013年7月8日 21:00夜盘开盘，DATE返回值即为130709，返回的为收盘时对应的日期 ,即数据所属的交易的日期（周五周六晚上的数据返回的日期为下周一的日期）

    例1：
    BARSLAST(DATE<>REF(DATE,1))+1;//当天开盘以来共有多少根K线。
    例2：
    AA:DATE=130507&&TIME=1037;
    HH:VALUEWHEN(AA=1,H);// 取201305071037分钟位置，同时取201305071037分钟k线位置最高价
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
        VALUEWHEN(HIGH>REF(HHV(HIGH,5),1),HIGH);
        VALUEWHEN(DATE<>REF(DATE,1),O);
        VALUEWHEN(DATE<>REF(DATE,1),L>REF(H,1));
        """,
            "params": [
            ],
            "expected": """
            

            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
