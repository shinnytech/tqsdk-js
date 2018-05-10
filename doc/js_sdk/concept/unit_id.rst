.. _about_unit_id:

关于 unit_id 的说明
=============================================

用户交易所下的每一笔委托单 (order)，都有一个 ``order_id`` 字段作为唯一标识。所有委托单的 ``order_id`` 不可以重复。

实现这样的需求，最简单的方法就是使用一个足够长的随机字符串。但是这样的 ``order_id`` 存在一个问题，本身没有携带任何有意义的信息，仅仅是为了区分不同的 order。

为了便于订单分类管理，这里提供两种设置 ``order_id`` 的方法：

+ 用户可以在下单时，指定 ``order_id`` 为任意字符串，只要保证互不重复。
+ 为 ``order_id`` 添加一组前缀 -- 交易单元 ``unit_id``，用 ``.`` 隔开。``unit_id`` 可以用 ``.`` 分隔出若干隔层级。``order_id`` 的结构是 ``unit_id.random_string``。

例如：

.. code-block:: javascript

    const TQ = new TQSDK();

    let order0 = TQ.INSERT_ORDER({
        symbol: "SHFE.cu1810",
        direction: "BUY",
        offset: "OPEN",
        volume: 2,
        limit_price: 2100,
        unit_id: "abc",
    });

    let order1 = TQ.INSERT_ORDER({
        symbol: "SHFE.cu1810",
        direction: "BUY",
        offset: "OPEN",
        volume: 2,
        limit_price: 2100,
        unit_id: "macd.AA",
    });

    // order0.order_id = 'abc.dioErhjw'
    // order1.order_id = 'macd.AA.okcSnjEk'

这样用户就可以为不同的交易策略添加不同的 ``unit_id``，方便查看、管理。在天勤软件中交易面板上的 **报单编号** 中可以看到效果。

系统已经定义的 ``unit_id``：

============================  ===========
发送报单位置                    unit_id
============================  ===========
天勤主程序报单                  MAIN
自编指标                       TA
程序化交易                     EXT
============================  ===========

