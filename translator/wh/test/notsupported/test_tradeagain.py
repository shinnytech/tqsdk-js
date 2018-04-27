#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    TRADE_AGAIN(N) 同一指令行可以连续出N个信号。

    用法：
    TRADE_AGAIN(N) 含有该函数的加减仓模型中,同一指令行可以连续出N个信号。

    注：
    1、该函数只适用于加减仓模型
    2、模型中写入该函数，一根K线只支持一个信号。不可以和MULTSIG、MULTSIG_MIN、PANZHONG_MIN函数同时使用。
    3、N个信号必须连续执行，如果期间出现其他信号，则N从新计算。
    4、N不可以写为变量。

    例：
    C>O,BK(1);//K线为阳线，买开1手
    C<O,SP(BKVOL);//K线为阴线，卖平多头持仓
    TRADE_AGAIN(3);//同一指令行可以连续执行3次（如果连续三根阳线，则连续三次买开仓）


    买开信号手数
    用法：
    BKVOL返回模型当前的多头理论持仓。
    1、加载运行：
    （1）模组子账户初始化后，BKVOL仍然返回根据信号下单手数计算的理论持仓，不受账户持仓的影响。
    （2）模组运行中手动调仓，头寸同步修改持仓，BKVOL返回值不变，仍然返回根据信号下单手数计算的理论持仓。
    （3）页面盒子运行中，BKVOL不受资金情况的限制，按照信号显示开仓手数。
    2、回测、模组运行中：
    （1）如果资金不够开仓，开仓手数为0，BKVOL返回值为0。
    （2）BK（BPK）信号出现并且确认固定后，BKVOL的取值增加开仓手数的数值；SP（SPK）信号出现并且确认固定后，BKVOL的取值减少平仓手数的数值。

    例：
    BKVOL=0&&C>O,BK(1);//多头理论持仓为0并且收盘价大于开盘价时，买开一手
    BKVOL>=1&&H>HV(H,5),BK(2); //多头持仓大于等于1，并且当根K线的最高价大于前面5个周期中最高价中最大值时，加仓2手
    BKVOL>0&&L<REF(L,5),SP(BKVOL); //多头持仓大于0，并且当根K线的最低价小于5个周期前K线的最低价时，卖平所有多头持仓

    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
    C>O,BK(1);//K线为阳线，买开1手
    C<O,SP(BKVOL);//K线为阴线，卖平多头持仓
    TRADE_AGAIN(3);//同一指令行可以连续执行3次（如果连续三根阳线，则连续三次买开仓）
        """,
            "params": [
            ],
            "expected": """
            

            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
