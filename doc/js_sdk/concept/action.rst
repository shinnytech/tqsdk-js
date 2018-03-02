.. _action:

Action 操作
========================================

直接发送指令
----------------------------------------
用户可以直接调用 SEND_MESSAGE 函数, 向主程序发送交易指令, 如下所示:

.. code-block:: javascript
    :caption: 直接发送一个下单指令

    SEND_MESSAGE({
        "aid": "insert_order",          //必填, 下单请求
        "unit_id": "abcd",              //必填, 指定一个交易单元
        "order_id": "0001",             //必填, 委托单号, 需确保在一个 unit_id 中不重复
        "user_id": "user1",             //可选, 与登录用户名一致, 在只登录了一个用户的情况下,此字段可省略
        "exchange_id": "SHFE",          //必填, 下单到哪个交易所
        "instrument_id": "cu1803",      //必填, 下单合约代码
        "direction": "BUY",             //必填, 下单买卖方向
        "offset": "OPEN",               //可选, 下单开平方向, 当指令相关对象不支持开平机制(例如股票)时可不填写此字段
        "volume": 1,                    //必填, 下单手数
        "price_type": "LIMIT",          //必填, 报单价格类型
        "limit_price": 30502,           //当 price_type == LIMIT 时需要填写此字段, 报单价格
    })

关于交易指令中的字段定义, 请参见 :ref:`insert_order` 和 :ref:`cancel_order`

SEND_MESSAGE 函数也可以发送任何其它指令, 参见 :ref:`wsapi`


通过sdk函数进行交易操作
----------------------------------------
为简化交易操作, TQSDK中封装了几个函数, 包括:

* :ref:`s_insert_order`
* :ref:`s_cancel_order`

