.. _api_get_quote:

获取指定合约对象 - GET_QUOTE
==================================

.. js:function:: TQ.GET_QUOTE(symbol)

    获取指定合约对象，可以查看最新行情

    :param string symbol: 合约代码。
    :returns: 返回指定合约对象。

参数说明
-------------------------------------------

symbol 表示指定合约，格式为 ``交易所代码.合约代码``。

:ref:`about_symbol`


用法示例
-------------------------------------------

.. code-block:: javascript
    :caption: 查看沪铜1809合约

    const TQ = new TQSDK();
    var quote = TQ.GET_QUOTE("SHFE.cu1809");
    if(quote.last_price > 3680) {
        // 执行操作
    }

.. code-block:: javascript
    :caption: 查看铁矿石1809合约

    var quote = TQ.GET_QUOTE("DCE.i1809");
    if(quote.close > 3680) {
        // 执行操作
    }

返回数据结构示例
-------------------------------------------

.. code-block:: javascript
    :caption: 返回的合约行情对应的数据结构

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
