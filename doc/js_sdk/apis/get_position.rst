.. _api_get_position:

获取持仓信息 - GET_POSITION
==================================

.. js:function:: TQ.GET_POSITION(symbol)

    获取指定合约对应持仓信息

    :param string symbol: 指定合约代码。
    :returns: 返回账户全部持仓对象。


参数说明
-------------------------------------------

symbol 表示指定合约，格式为 ``交易所代码.合约代码``。

:ref:`about_symbol`


用法示例
-------------------------------------------

查看当前账户指定合约持仓信息：

.. code-block:: javascript

    var position = TQ.GET_POSITION("SHFE.cu1801");


返回数据结构示例
----------------------------------

某个合约持仓信息

.. code-block:: javascript

    {
        "exchange_id": "SHFE",                        //交易所代码
        "instrument_id": "cu1801",                    //合约代码
        "volume_long": 5,                             //多头持仓手数
        "volume_short": 5,                            //空头持仓手数
        "hedge_flag": "SPEC",                         //套保标记
        //参考字段
        "open_price_long": 3203.5,                    //多头开仓均价
        "open_price_short": 3100.5,                   //空头开仓均价
        "open_cost_long": 3203.5,                     //多头开仓市值
        "open_cost_short": 3100.5,                    //空头开仓市值
        "margin": 32324.4,                            //占用保证金
        "float_profit_long": 32324.4,                 //多头浮动盈亏
        "float_profit_short": 32324.4,                //空头浮动盈亏
        "volume_long_today": 5,                       //多头今仓手数
        "volume_long_his": 5,                         //多头老仓手数
        "volume_long_frozen": 5,                      //多头持仓冻结
        "volume_long_frozen_today": 5,                //多头今仓冻结
        "volume_short_today": 5,                      //空头今仓手数
        "volume_short_his": 5,                        //空头老仓手数
        "volume_short_frozen": 5,                     //空头持仓冻结
        "volume_short_frozen_today": 5,               //空头今仓冻结
    }
