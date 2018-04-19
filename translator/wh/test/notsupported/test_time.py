#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    TIME，取K线时间。

    注：
    1、该函数在盘中实时返回，在K线走完后返回K线的起始时间。
    2、该函数返回的是交易所数据接收时间，也就是交易所时间。
    3、TIME函数在秒周期使用时返回六位数的形式，即：HHMMSS，在其他周期上显示为四位数的形式，即：HHMM.
    4、TIME函数只能加载在日周期以下的周期中，在日周期及日周期以上的周期中该函数返回值始终为1500。
    5、使用TIME函数进行尾盘平仓的操作需要注意
    （1）尾盘平仓设置的时间建议设置为K线返回值中实际可以取到的时间（如：螺纹指数 5分钟周期 最后一根K线返回时间为1455，尾盘平仓设置为TIME>=1458,CLOSEOUT;则效果测试中不能出现尾盘平仓的信号）
    （2）使用TIME函数作为尾盘平仓的条件的，建议开仓条件也要做相应的时间限制（如设置尾盘平仓条件为TIME>=1458,CLOSEOUT;则相应的开仓条件中需要添加条件TIME<1458；避免平仓后再次开仓的情况）

    例1:
    C>O&&TIME<1450,BK;
    C<O&&TIME<1450,SK;
    TIME>=1450,SP;
    TIME>=1450,BP;
    AUTOFILTER;
    //在14:50后平仓。
    例2：
    ISLASTSK=0&&C>O&&TIME>=0915,SK;
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
