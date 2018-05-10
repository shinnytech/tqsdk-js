.. _get_position_dict:

获取持仓信息 - GET_POSITION_DICT
==================================

.. js:function:: GET_POSITION_DICT()

    获取该用户全部持仓信息

    :returns: 返回账户全部持仓对象。


用法示例
-------------------------------------------

查看当前账户指定合约持仓信息：

.. code-block:: javascript

    const TQ = new TQSDK();
    var positions = TQ.GET_POSITION();


返回数据结构示例
----------------------------------

返回全部持仓信息：

.. code-block:: javascript

    {
        "SHFE.cu1801": {      // 合约的 symbol 作为 key 值
            //核心字段
            "exchange_id": "SHFE",                        //交易所
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
        },
        ......   // 其他合约的持仓
    }
