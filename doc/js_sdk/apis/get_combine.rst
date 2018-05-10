.. _s_get_combine:

TQ.GET_COMBINE
==================================

获取用户自定义组合信息

.. js:function:: GET_COMBINE(combine_name, from=TQ.DATA)

    :param string combine_name: 自定义组合的名称。
    :param object from: 数据源 (TQ.DATA 或 TQ.CHANGING_DATA)。
    :returns: 返回用户自定义组合信息。


用法示例
----------------------------------

如果您想查看某个自定义组合的信息可以这样查看：

.. code-block:: javascript

    var weights = TQ.GET_COMBINE('rr');

如果您想知道最近一次数据包中自定义组合的信息有没有更改，可以这样写：

.. code-block:: javascript

    var weights = TQ.GET_COMBINE('rr', TQ.CHANGING_DATA);

返回数据结构示例
----------------------------------

.. code-block:: javascript

    {
        'SHFE.cu1803': 1,
        'SHFE.cu1805': -1,
    }