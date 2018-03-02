.. _s_get_quote:

TQ.GET_QUOTE
==================================

获取指定合约对象

.. js:function:: TQ.GET_QUOTE(instrument_id, from=TQ.DATA)

    :param string instrument_id: 合约代码。
    :param object from: 数据源 (TQ.DATA 或 TQ.CHANGING_DATA)。
    :returns: 返回指定合约对象。


用法示例
----------------------------------

查看内存中某个合约对应的信息：

.. code-block:: javascript

    var quote = TQ.GET_QUOTE("SHFE.cu1805");
    if(quote.last_price > 3680) {
        // 执行操作
    }

如果您想知道最近一次数据包中，该合约所更新的字段信息，可以这样写：

.. code-block:: javascript

    var quote = TQ.GET_QUOTE("SHFE.cu1805", TQ.CHANGING_DATA);


返回数据结构示例
----------------------------------

.. code-block:: javascript

    {
        "instrument_id": "cu1805",                        //合约代码
        "datetime": "2016-12-30 13:21:32.500000",         //时间
        "ask_price1": 36590.0,                            //卖价
        "ask_volume1": 121,                               //卖量
        "bid_price1": 36580.0,                            //买价
        "bid_volume1": 3,                                 //买量
        "last_price": 36580.0,                            //最新价
        "highest": 36580.0,                               //最高价
        "lowest": 36580.0,                                //最低价
        "amount": 213445312.5,                            //成交额
        "volume": 23344,                                  //成交量
        "open_interest": 23344,                           //持仓量
        "pre_open_interest": 23344,                       //昨持
        "pre_close": 36170.0,                             //昨收
        "open": 36270.0,                                  //今开
        "close": 36270.0,                                 //收盘
        "lower_limit": 34160.0,                           //跌停
        "upper_limit": 38530.0,                           //涨停
        "average": 36270.1,                               //均价
        "pre_settlement": 36270.0,                        //昨结
        "settlement": 36270.0,                            //结算价
    }