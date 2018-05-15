.. _C.ORDER:

C.ORDER - 交易指令
=======================================

ORDER 函数用于发送下单或撤单指令


Example
--------------------------------------------------
.. code-block:: javascript

    let close = C.ORDER("CLOSE");

Syntax
--------------------------------------------------

.. c:function:: C.ORDER(current_i, direction, offset, volume, limit_price, order_symbol)

   发送委托单

   :param number current_i: 必填，当前 K 线 id
   :param string direction: 必填，委托单方向，"BUY" | "SELL"
   :param string offset: 必填，委托单开平，"OPEN" | "CLOSE" | "OPENCLOSE"
   :param string volume: 必填，委托单手数
   :param string limit_price: 可选，委托单价格（全部是限价指令），默认对手价
   :param string order_symbol: 可选，合约，默认当前合约
   :return: null


Remarks
--------------------------------------------------
技术指标通过C.SERIAL函数来定义输入序列。每次调用C.SEIRAL可以定义一个输入序列。如果技术指标有多个输入序列，应调用多次C.SERIAL函数


