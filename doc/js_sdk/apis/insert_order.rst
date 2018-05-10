.. _api_insert_order:

下委托单 - INSERT_ORDER
==================================

.. js:function:: INSERT_ORDER(order_param)

    发送委托单

   :param object order_param: 参数对象。
   :returns: order 对象。


参数说明
-------------------------------------------

order_param 中必须包括的字段有（多余的字段不会影响下单）：

================  ========  ======  =============================  ==================
name              type      option  memo                           example
================  ========  ======  =============================  ==================
symbol            string    必填    合约标识，:ref:`about_symbol`    CFFEX.TF1803
direction         string    必填    买卖 "BUY"|"SELL"               SELL
offset            string    必填    方向 "OPEN"|"CLOSE"             OPEN
volume            number    必填    手数                            4
limit_price       number    必填    限价价格                        96.250
order_id          string    可选    指定 order_id
unit_id           string    可选    :ref:`about_unit_id`
================  ========  ======  =============================  ==================

.. attention::

    如果参数中指定了 order_id，那么用户委托单号就是指定的 **order_id**，但是用户指定时需要保证不同的委托单 order_id 不重复；

    如果没有指定 order_id，但是指定了 unit_id，那么委托单号就是 **unit_id.random_string**；

    如果 order_id 和 unit_id 都没有指定，那么委托单号就由系统指定，保证不重复。

用法示例
----------------------------------

.. code-block:: javascript

    const TQ = new TQSDK();
    let order = TQ.INSERT_ORDER({
        symbol: "SHFE.cu1810",
        direction: "BUY",
        offset: "OPEN",
        volume: 2,
        limit_price: 2100,
        unit_id: "abc",
    });


返回数据结构示例
----------------------------------

.. code-block:: javascript

    {
        "order_id": "DK.djkIjXj",             //委托单ID, 在每个会话中唯一
        "exchange_id": "SHFE",                        //交易所
        "instrument_id": "cu1810",                    //合约代码
        "direction": "BUY",                           //下单方向
        "offset": "OPEN",                             //开平标志
        "volume_orign": 6,                            //总报单手数
        "volume_left": 3,                             //未成交手数
        "price_type": "LIMIT",                        //价格类型
        "limit_price": 45000,                         //委托价格, 仅当 price_type = LIMIT 时有效
        "status": "ALIVE",                            //委托单状态, ALIVE=有效, FINISHED=已完
    }
