.. _s_get_session:

方法 C.GET_SESSION 
==================================

获取当前会话信息

.. js:function:: GET_SESSION(from)

    :param object from: 数据源。
    :returns: 返回当前会话对象。

数据源
----------------------------------

C.LATEST_DATA

C.LAST_UPDATED_DATA 

示例
----------------------------------

查看当前会话对象：

.. code-block:: javascript

    function * Task(C){
        ...
        var session = C.GET_SESSION();
        ...
    }

查看最近一次会话对象的更新信息：

.. code-block:: javascript

    function * Task(C){
        ...
        var session = C.GET_SESSION(C.LAST_UPDATED_DATA );
        ...
    }

返回数据结构示例
----------------------------------

返回当前session信息：

.. code-block:: javascript

    {
        "session_id": "1434",
        "max_order_id": "4423",
    }