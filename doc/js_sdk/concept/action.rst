.. _action:

Action 操作
========================================

系统中有两种方式可以发送指令到服务器。


1. 通过 tqsdk 函数进行交易操作
----------------------------------------
为简化交易操作, TQSDK 中提供了两个函数，只填写程序交易必要的参数。

关于有哪些必要参数和这两个函数的具体使用方法, 请参见：

* 下单 :ref:`s_insert_order`
* 撤单 :ref:`s_cancel_order`


2. 直接发送指令
----------------------------------------
用户可以直接调用 WS.SEND_MESSAGE 函数, 向主程序发送交易指令。

.. tip::
    WS 是一个全局对象，表示连接到服务器的 Websocket 连接。

    SEND_MESSAGE 向服务器发送数据，只有一个 object 类型参数，即发送的内容。

具体可以发送的指令如下：

.. code-block:: javascript
    :caption: 直接发送一个下单指令

    WS.SEND_MESSAGE({
        "aid": "insert_order",          //必填, 下单请求
        "unit_id": "abcd",              //必填, 指定一个交易单元
        "order_id": "0001",             //必填, 委托单号, 需确保在一个 unit_id 中不重复
        "exchange_id": "SHFE",          //必填, 下单到哪个交易所
        "instrument_id": "cu1803",      //必填, 下单合约代码
        "direction": "BUY",             //必填, 下单买卖方向
        "offset": "OPEN",               //可选, 下单开平方向, 当指令相关对象不支持开平机制(例如股票)时可不填写此字段
        "volume": 1,                    //必填, 下单手数
        "price_type": "LIMIT",          //必填, 报单价格类型
        "limit_price": 30502,           //当 price_type == LIMIT 时需要填写此字段, 报单价格
    })

.. code-block:: javascript
    :caption: 直接发送一个撤单指令

    WS.SEND_MESSAGE({
        "aid": "cancel_order",          //必填, 撤单请求
        "unit_id": "abcd",              //必填, 指定交易单元
        "order_id": "0001",             //必填, 委托单号
    })

关于 unit_id 和 order_id 的说明
----------------------------------------------

通过 tqsdk 提供的函数发送下单指令时，通过以下规则使得不同 unit_id 下的 order_id 不重复:

* order_id 的生成规则：[BrowserId]-[PageId]-[OrderId]
    - BrowserId：标识浏览器的唯一 id
    - PageId：标识当前页面的唯一 id
    - OrderId：每个页面从 0 开始生成的序数数列
    
* unit_id 的生成规则：默认与当前执行的 Task 的 id 相同
    - TaskId：每个页面的 Task 都有一个 id 值，如果参数中没有传入 unit_id，则 unit_id 与 TaskId 相同；如果您想自定义 unit_id，请显示传入 unit_id 字段的值。

您如果使用第二种方式，需要自己定义 unit_id 和 order_id，您可以遵循如下规则：

.. code-block:: javascript

    order_id = BrowserId + '-' + PageId + '-' + GenOrderId.next().value;
    // order_id = 'LNgb-3-4', 这样可以保证所有下单的 order_id 都不重复
    // unit_id 您可以设置为任意字符串

SEND_MESSAGE 函数也可以发送任何其它指令, 参见 :ref:`wsapi`
