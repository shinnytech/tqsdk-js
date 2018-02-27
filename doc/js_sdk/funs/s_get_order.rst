.. _s_get_order:

方法 C.GET_ORDER 
==================================

获取指定 id 的订单对象

.. js:function:: GET_ORDER(order_id, from)

    :param string order_id: 订单id。
    :param object from: 数据源。
    :returns: 返回指定 id 的订单对象。

数据源
----------------------------------

C.LATEST_DATA

C.LAST_UPDATED_DATA 

.. hint::
    这里 C 表示 Task 函数的一个参数。


示例
----------------------------------

如果您已经获得 order_id ，可以这样查看指定 id 的信息：

.. code-block:: javascript

    function * Task(C){
        ...
        var order = C.GET_ORDER(id);
        ...
    }

该函数有一个简便用法，如果您想知道当前 Task 已经下的全部订单，可以这样查询：

.. code-block:: javascript

    function * Task(C){
        ...
        var orders = C.GET_ORDER();
        ...
    }

如果您想知道最近一次数据包中，包含某个 order_id 的订单，可以这样写：

.. code-block:: javascript

    function * Task(Ctx){
        ...
        var order = Ctx.GET_ORDER(order_id, C.LAST_UPDATED_DATE);
        ...
    }

如果您想知道最近一次数据包中，包含的当前 Task 下的订单，可以这样写：

.. code-block:: javascript

    function * Task(Ctx){
        ...
        var orders = Ctx.GET_ORDER(null, C.LAST_UPDATED_DATE);
        ...
    }