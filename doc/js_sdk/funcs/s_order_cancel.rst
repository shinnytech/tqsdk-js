.. _s_cancel_order:

方法 C.CANCEL_ORDER
==================================
 
撤销下单。

.. js:function:: CANCEL_ORDER(order)

   :param object order: 订单对象
   :returns: order 

示例
----------------------------------

.. code-block:: javascript

    function * Task(C){
        ...
        var order_param = {
            exchange_id: "CFFEX",
            instrument_id: "TF1803",
            direction: "BUY",
            offset: "OPEN",
            volume: 4,
            limit_price: 96
        }
        var order = C.INSERT_ORDER(order_param);
        // 下单不成功，退出
        if(!order) return;
        // 下单成功，继续执行后续代码
        var result = yield {
            UPDATED: function () { return C.GET_ORDER(order.exchange_order_id, C.LAST_UPDATED_DATA); },
            USER_CLICK_STOP: C.ON_CLICK('STOP'),
        };
        if (order.status != "FINISHED")
            C.CANCEL_ORDER(order);
        if (result.USER_CLICK_STOP)
            return;
        ...
    }