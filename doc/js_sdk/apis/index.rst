.. _tqsdk_apis:



TQSDK 在实例化之后才可以使用，每个页面只需要一个 TQSDK 实例。

.. code-block:: javascript
    :caption: 实例化 TQSDK

        const TQ = new TQSDK();
        // .... 用户代码


APIS 提供的接口分为以下几类：

行情、交易数据
------------------------------------------------------------

.. toctree::
    :maxdepth: 1

    s_get_quote.rst
    s_get_account.rst
    s_get_position.rst
    s_get_order.rst
    s_get_combine.rst
    s_get_position.rst
    s_get_kline.rst

    * IS_CHANGING // IS_CHANGING(obj) 在最近一次数据更新中
    * GET_ACCOUNT
    * GET_POSITION(symbol)
    * GET_UNIT_POSITION(unit_id, symbol)
    * GET_COMBINE(combine_id)
    * GET_POSITION_DICT()
    * GET_TRADE_DICT()
    * GET_ORDER_DICT()
    * GET_QUOTE(symbol)
    * GET_KLINE({ kline_id = RandomStr(), symbol=GLOBAL_CONTEXT.symbol, duration=GLOBAL_CONTEXT.duration, width = 100 }={})
    * register_ws_processor（evt, func） 添加websock回调函数 onmessage/onopen/onreconnect/onclose

下单
------------------------------------------------------------
.. toctree::
    :maxdepth: 1

    s_insert_order.rst
    s_cancel_order.rst


任务管理
------------------------------------------------------------
.. toctree::
    :maxdepth: 1
    g_start_task.rst
    g_pause_task.rst
    g_resume_task.rst
    g_stop_task.rst


指标管理
------------------------------------------------------------
.. toctree::
    :maxdepth: 1
    * REGISTER_INDICATOR_CLASS(ind_class)
    * UNREGISTER_INDICATOR_CLASS(ind_class_name)
    * NEW_INDICATOR_INSTANCE(ind_func, symbol, dur_sec, params={}, instance_id=RandomStr())
    * DELETE_INDICATOR_INSTANCE(ind_instance)

UI
-------------------------------------------------------------
.. toctree::
    :maxdepth: 1

    g_ui.rst
    s_on_change.rst
    s_on_click.rst

        * :ref:`SET_STATE <g_stop_task>` (cmd) // RESUME/PAUSE/STOP
