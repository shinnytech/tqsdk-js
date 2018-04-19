#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    CLOSEMINUTE1，返回距离收盘前的分钟数。

    注：
    1、该函数只能用于指令价模型。
    2、
    历史K线：该函数返回K线结束时间距离收盘的分钟数。
    盘中：该函数返回K线当前时间距离收盘的分钟数。
    3、该函数需要在分钟，小时，日线周期使用；不支持在TICK周期，秒周期，量能周期，周线及以上周期使用。
    4、该函数返回值包含小结和午休的时间。
    5、CLOSEMINUTE1返回的是交易所的时间，不是本机的时间。
    6、对于夜盘合约，夜盘收盘不是当日收盘，15点收盘才算作当日收盘。
    7、CLOSEMINUTE1在合约交割日，返回实际收盘时间。
    8、CLOSEMINUTE1加载到主力合约上，主力换月和合约交割在同一天，则按照交割日的收盘时间计算，主力换月和合约交割不在同一天，那么按照正常的非交割日进行计算。
    9、该函数不支持和CLOSESEC1同时使用。
    10、CLOSEMINUTE1与逐分钟回测函数CHECKSIG_MIN 、MULTSIG_MIN、PANZHONG_MIN连用，想实现日内闭式前及时平仓，CLOSEMINUTE1的参数取值需大于1，即CLOSEMINUTE1需<=大于1 的值。

    例：
    CROSS(C,MA(C,5)),BK;//最新价上穿五周期均线，买开
    MULTSIG(0,0,1,0);//使用TICK数据回测，出信号立即下单，不复核
    CLOSEMINUTE1<=1,CLOSEOUT;//收盘前1分钟，清仓
    AUTOFILTER;
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
