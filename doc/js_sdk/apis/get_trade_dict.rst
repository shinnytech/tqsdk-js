.. _api_get_trade_dict:

获取成交记录 - GET_TRADE_DICT
==================================

.. js:function:: GET_TRADE_DICT()

    获取用户当前账户下全部成交记录信息

    :returns: 返回全部成交记录对象。

用法示例
----------------------------------

.. code-block:: javascript

    const TQ = new TQSDK();
    var trades = TQ.GET_TRADE_DICT();


返回数据结构示例
----------------------------------

.. code-block:: javascript

    {
        "abc|123|1": {     //trade_key, 用于唯一标识一个成交项
            "order_id": "123",
            "exchange_id": "SHFE",                        //交易所
            "instrument_id": "cu1801",                    //交易所内的合约代码
            "exchange_trade_id": "1243",                  //交易所成交号
            "direction": "BUY",                           //成交方向
            "offset": "OPEN",                             //开平标志
            "volume": 6,                                  //成交手数
            "price": 1234.5,                              //成交价格
            "trade_date_time": 1928374000000000           //成交时间
        },
        ......
    }
