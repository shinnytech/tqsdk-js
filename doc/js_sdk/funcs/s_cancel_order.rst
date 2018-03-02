.. _s_cancel_order:

TQ.CANCEL_ORDER
==================================
 
撤销下单。

.. js:function:: CANCEL_ORDER(order)

   :param object order: 订单对象
   :returns: order 

示例
----------------------------------

.. code-block:: javascript

    var order_param = {
        exchange_id: "CFFEX",
        instrument_id: "TF1803",
        direction: "BUY",
        offset: "OPEN",
        volume: 4,
        limit_price: 96
    }
    var order = TQ.INSERT_ORDER(order_param);
    TQ.CANCEL_ORDER(order);
