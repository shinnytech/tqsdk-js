.. _api_delete_indicator_instance:

删除指标实例 - DELETE_INDICATOR_INSTANCE
====================================================================

.. js:function:: DELETE_INDICATOR_INSTANCE(ind_instance)

    删除一个已经建立的指标实例

    :param function ind_instance: 指标实例对象
    :returns: null


用法示例
--------------------------------------------------------------------

.. code-block:: javascript

    const TQ = new TQSDK();
    let params = {
        N1: 1,
        N2: 3,
        N3: 5,
        N4: 7
    };
    let ins = TQ.NEW_INDICATOR_INSTANCE(ma, "SHFE.rb1810", 10, params);
    TQ.DELETE_INDICATOR_INSTANCE(ins);

