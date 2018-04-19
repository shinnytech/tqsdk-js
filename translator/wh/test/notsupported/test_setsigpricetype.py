#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    SETSIGPRICETYPE(SIG,PRICE,IsCancel),不同的信号设置不同的委托方式。

    用法：SETSIGPRICETYPE(SIG,PRICE1,IsCancel),设置SIG指令的委托方式，PRICE为委托价格，IsCancel为是否启用终止下单。

    注：
    1、SIG位置为交易指令，包括BK\SK\BP\SP\BPK\SPK\CLOSEOUT\STOP\STOP1所有指令。
    2、PRICE位置为委托价格，包括以下八种：
    （1）NEW_ORDER 最新价
    注：委托方式为NEW_ORDER时支持回测，计算信号价格为信号发出时的最新价。
    例如，收盘价模型，当前k线出信号，价格取下一根k线开盘价
    （2）PASSIVE_ORDER 排队价
    （3）ACTIVE_ORDER 对价
    （4）TRACING_ORDER 自动连续追
    A：首次下单委托价格参数设置->程序化参数->追价设置的价格方式执行。
    B：股票合约不支持追价。
    （5）CMPETITV_ORDER 超价
    A：下单基准按参数设置->程序化参数->超价设置的价格方式执行
    （6）LIMIT_ORDER 市价
    （7）SIGPRICE_ORDER 触发价
    （8）指定价 可以为具体的数值，也可以为表达式，即支持如下的写法：
    A:HHV(H,3);//定义A为3个周期内的最高价
    SETSIGPRICETYPE(BK,A);//BK信号按照3个周期的最高价委托
    3、参数IsCancel写入CANCEL_ORDER表示启用终止下单程序，
      即：根据PRICE委托后，N秒不成交自动撤单并终止下单。
      参数IsCancel位置不写或写入其他内容，则代表不启用终止下单。
    （1）参数N，在参数设置->程序化参数中进行设置。
    （2）终止下单不考虑小节休息。
    （3）BP、SP、BPK、SPK、CLOSEOUT、STOP、STOP1信号不支持CANCEL_ORDER设置。
    4、模型编写中未使用该函数设置指令委托价格方式，默认按照交易参数中设置的程序化默认下单方式进行委托。
    5、SETALLSIGPRICETYPE不能和SETSIGPRICETYPE同时使用。
    6、该函数只在模组中或者信号预警盒子勾选直接下单不需要手动确认时才生效。

    例：
    C>HV(H,20),BK;//价格大于前20周期高点买开仓
    C<LV(L,20),SK;//价格小于前20周期低点卖开仓
    C>HV(H,10),BP;//价格大于前10周期高点平空仓
    C<LV(L,10),SP;//价格小于前10周期低点平多仓
    SETSIGPRICETYPE(BK,SIGPRICE_ORDER);//买开的委托以触发价委托
    SETSIGPRICETYPE(SK,REF(C,1));//卖开的委托以上一周期的收盘价委托
    SETSIGPRICETYPE(BP,TRACING_ORDER);//买平的委托以自动连续追价委托
    SETSIGPRICETYPE(SP,TRACING_ORDER);//卖平的委托以自动连续追价委托
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
