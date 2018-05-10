.. _api_get_combine:

获取组合信息 - GET_COMBINE
==================================

.. js:function:: GET_COMBINE(combine_id)

    获取用户自定义组合信息

    :param string combine_id: 自定义组合代码。
    :returns: 返回用户自定义组合信息。

参数说明
-------------------------------------------

combine_id 就是用户在天勤软件 ``自编组合`` 中输入的自定义组合的代码。

返回的组合信息，就是自编组合中设置的各个合约和对应的权重。

用法示例
----------------------------------

如果您想查看某个自定义组合的信息可以这样查看：

.. code-block:: javascript

    const TQ = new TQSDK();
    var weights = TQ.GET_COMBINE('rr');


返回数据结构示例
----------------------------------

.. code-block:: javascript

    {
        'SHFE.cu1803': 1,
        'SHFE.cu1805': -1,
    }
