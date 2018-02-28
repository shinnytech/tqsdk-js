.. _s_get_combine:

方法 C.GET_COMBINE 
==================================

获取用户自定义组合信息

.. js:function:: GET_COMBINE(combine_name, from)

    :param string combine_name: 自定义组合的名称。
    :param object from: 数据源
    :returns: 返回用户自定义组合信息。


数据源
----------------------------------

C.LATEST_DATA

C.LAST_UPDATED_DATA 

.. hint::
    这里 C 表示 Task 函数的一个参数。
    
示例
----------------------------------

如果您想查看某个自定义组合的信息可以这样查看：

.. code-block:: javascript

    function * Task(C){
        ...
        var weights = C.GET_COMBINE('rr');
        ...
    }

如果您想知道最近一次数据包中自定义组合的信息有没有更改，可以这样写：

.. code-block:: javascript

    function * Task(C){
        ...
        var weights = C.GET_COMBINE('rr', C.LAST_UPDATED_DATE);
        ...
    }

返回数据结构示例
----------------------------------

.. code-block:: javascript

    {
        'SHFE.cu1803': 1,
        'SHFE.cu1805': -1,
    }