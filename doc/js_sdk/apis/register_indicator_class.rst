.. _api_register_indicator_class:

订阅指标类 - REGISTER_INDICATOR_CLASS
===================================================================

.. js:function:: REGISTER_INDICATOR_CLASS(indicator_class)

    向主程序订阅一个指标类

    :param function indicator_class: 指标类函数。
    :returns: null


用法示例
--------------------------------------------------------------------

.. code-block:: javascript

    const TQ = new TQSDK();
    TQ.REGISTER_INDICATOR_CLASS(ma);
