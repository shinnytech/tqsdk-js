.. _api_send_message:

发送数据包 - SEND_MESSAGE
==============================

.. js:function:: SEND_MESSAGE(obj)

    向服务器发送数据

   :param object obj: 要发送的数据包
       :returns: null


.. note::

    使用 SEND_MESSAGE 函数发送数据包，必须清楚地知道发送数据包指令地确切含义，发送错误地数据包的后果是不可预期的，相关文档参见 :ref:`wsapi`。

    下单、撤单指令推荐使用 :ref:`api_insert_order` 和 :ref:`api_cancel_order`。


用法示例
----------------------------------

.. code-block:: javascript
    :caption: 直接发送一个下单指令

    const TQ = new TQSDK();
    TQ.SEND_MESSAGE({
        "aid": "insert_order",          //必填, 下单请求
        "order_id": "0001",             //必填, 委托单号, 需确保不同委托单单号不重复
        "exchange_id": "SHFE",          //必填, 下单到哪个交易所
        "instrument_id": "cu1803",      //必填, 下单合约代码
        "direction": "BUY",             //必填, 下单买卖方向
        "offset": "OPEN",               //可选, 下单开平方向, 当指令相关对象不支持开平机制(例如股票)时可不填写此字段
        "volume": 1,                    //必填, 下单手数
        "price_type": "LIMIT",          //必填, 报单价格类型
        "limit_price": 30502,           //当 price_type == LIMIT 时需要填写此字段, 报单价格
    });


.. code-block:: javascript
    :caption: 直接发送一个撤单指令

    TQ.SEND_MESSAGE({
        "aid": "cancel_order",          //必填, 撤单请求
        "order_id": "0001",             //必填, 委托单号
    });
