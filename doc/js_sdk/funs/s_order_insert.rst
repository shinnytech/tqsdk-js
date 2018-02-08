.. _s_order_insert:

INSERT_ORDER 下单
==================================

根据传入参数下单。

.. js:function:: INSERT_ORDER(order_param)

   :param object order_param: 参数对象
   :returns: 判断数据对象是否更新的函数  

order_param 中必须包括的字段有（多余的字段不想影响下单）：

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
