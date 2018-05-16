#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    FEE手续费

    用法：FEE返回当前合约的手续费，用于模型中资金、手数相关计算。

    注：
    1、主图加载、回测中，FEE取值为回测参数中，对手续费的设置
    2、模组子账户运行时FEE取值为模组子账户加载时保证金参数中手续费的设置
    3、当交易品种手续费为按手数收取，返回值为手续费数值
    4、当交易品种手续费按比例收取,返回值为手续费比例，数值为小数

    例：
    K:=MONEYTOT*0.2/(C*MARGIN*UNIT+FEE); //模组子账户权益的20%可以开仓的手数（此写法适用于按固定手数收取手续费的合约）

    MARGIN 保证金率 => C.MARGIN()

    // 合约乘数 / 交易单位
    UNIT  数据合约 =>  C.VM() or TQ.GET_VM(C.trade_symbol)
    UNIT1 交易合约 => C.VM() or TQ.GET_VM(C.trade_symbol)

    //合约价格最小变动单位
    MINPRICE 数据合约 => C.PTICK()  or TQ.GET_PTICK(C.trade_symbol)
    MINPRICE1 交易合约 => C.PTICK()  or TQ.GET_PTICK(C.trade_symbol)
    MINPRICED 任意合约 => C.PTICK(symbol) or TQ.GET_PTICK(symbol)

    // 每手手续费
    FEE => C.FEE()

    // 以下都是可以接受一个 symbol 参数，如果没有，默认使用 C.trade_symbol
    C.MARGIN() C.VM() C.PTICK() C.FEE()

    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
    K:=MONEYTOT*0.2/(C*MARGIN*UNIT+FEE); //模组子账户权益的20%可以开仓的手数（此写法适用于按固定手数收取手续费的合约）
        """,
            "params": [
            ],
            "expected": """


            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
