.. _s_order_insert:

方法 C.INSERT_ORDER
==================================

根据传入参数下单。

.. js:function:: INSERT_ORDER(order_param)

   :param object order_param: 参数对象
   :returns: order 或者 false

order_param 中必须包括的字段有（多余的字段不会影响下单）：

================  ========  ===================  =========
name              type      memo                 example
================  ========  ===================  =========
exchange_id       string    交易所代码             CFFEX
instrument_id     string    合约代码               TF1803
direction         string    买卖 "BUY"|"SELL"     SELL              
offset            string    方向 "OPEN"|"CLOSE"   OPEN           
volume            number    手数                  4
limit_price       number    限价价格               96
================  ========  ===================  =========

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
        ...
    }
