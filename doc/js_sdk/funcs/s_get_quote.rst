.. _s_get_quote:

方法 C.GET_QUOTE 
==================================

获取指定合约对象

.. js:function:: GET_QUOTE(instrument_id, from)

    :param string instrument_id: 合约代码。
    :param object from: 数据源。
    :returns: 返回指定合约对象。

数据源
----------------------------------

C.LATEST_DATA

C.LAST_UPDATED_DATA 

.. hint::
    这里 C 表示 Task 函数的一个参数。

示例
----------------------------------

.. code-block:: javascript

    function * Task(C){
        ...
        var order = C.GET_ORDER();
        ...
    }