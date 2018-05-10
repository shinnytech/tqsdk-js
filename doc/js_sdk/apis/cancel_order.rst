.. _api_cancel_order:

撤单 - CANCEL_ORDER
==================================

.. js:function:: CANCEL_ORDER(condition)

    发送撤单指令

   :param any condition: 委托单选择条件
   :returns: order

参数说明
-------------------------------------------

condition 可以接受以下两种情况：

1. object 类型 - order 对象，接口会发送撤销指定的委托单的指令；
2. string 类型 - unit_id，接口会发送撤销符合指定 unit_id 的委托单的指令。


用法示例
----------------------------------


.. code-block:: javascript
    :caption: 撤销指定委托单

    const TQ = new TQSDK();
    let order = TQ.INSERT_ORDER({
        symbol: "SHFE.cu1810",
        direction: "BUY",
        offset: "OPEN",
        volume: 2,
        limit_price: 2100,
        unit_id: "abc",
    });
    // ......
    // 若干操作和判断条件
    // ......
    TQ.CANCEL_ORDER(order);

.. code-block:: javascript
    :caption: 撤销指定 unit_id 的委托单

    // ......
    // 若干操作和判断条件
    // ......
    TQ.CANCEL_ORDER("abc");
