.. _api_unregister_indicator_class:

取消订阅一个指标类 - UNREGISTER_INDICATOR_CLASS
====================================================================

取消订阅一个指标类

.. js:function:: UNREGISTER_INDICATOR_CLASS(ind_class_name)

    :param function ind_class_name: 指标类函数名
    :returns: null


用法示例
--------------------------------------------------------------------

.. code-block:: javascript

    const TQ = new TQSDK();
    TQ.UNREGISTER_INDICATOR_CLASS(ma);
