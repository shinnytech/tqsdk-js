.. _s_get_kline:

TQ.GET_KLINE
====================================================================

获取指定 K 线序列。

.. js:function:: TQ.GET_KLINE(config)

    :param object config: K 线序列参数。
    :returns: 返回 K 线对象。


K 线序列参数说明
--------------------------------------------------------------------

======== ================ ================================================
params   default          note
======== ================ ================================================
kline_id 随机字符串         默认为一个 8 位长的随机字符串
-------- ---------------- ------------------------------------------------
symbol                    必填，合约 symbol。
-------- ---------------- ------------------------------------------------
duration                  必填，K 线周期，以秒为单位。
-------- ---------------- ------------------------------------------------
width    100              K 线序列长度，最新一个柱子为 K 线序列的最后一个值。
======== ================ ================================================

.. note::
    kline_id 是 K 线对象的唯一标识，设置相同的 kline_id，会覆盖前一个 K 线对象。

用法说明
--------------------------------------------------------------------

1. 得到一个 K 线序列

.. code-block:: javascript

    var kseq = TQ.GET_KLINE({
        kline_id: 'my_kline', // 若没有指定值，默认为一个 8 位长的随机字符串，随机字符串不会重复
        symbol: 'SHFE.cu1805',
        duration: 10,
        width: 200, // 若没有指定值，默认设定为 100
    });

2. 使用 K 线序列

.. code-block:: javascript
    :caption: 查看 K 线序列属性值

    kseq.kline_id // 'my_kline'
    kseq.symbol // 'SHFE.cu1805'
    kseq.duration // 10
    kseq.width // 200
    

.. code-block:: javascript
    :caption: 查看 K 线序列某个字段的序列

    var open = kseq.open;
    // [51460, 51470, 51470, ... , 52210]
    // 返回长度为 200 的数组，对应 K 线的开盘价序列，若数据还没从服务器返回，则对应位置为 undefined

    var datetime = kseq.datetime; // UnixNano 时间
    var open = kseq.open; // 开
    var high = kseq.high; // 高
    var low = kseq.low; // 低
    var close = kseq.close; // 收
    var volume = kseq.volume; // 成交量
    var open_oi = kseq.open_oi; // 起始持仓量
    var close_oi = kseq.close_oi; // 结束持仓量

K 线序列对象也支持像数组一样用下标访问，下标从 0 开始到 width - 1。当下标 >= 0 时，表示从前往后计数；当下标 < 0 时，表示从后往前倒数计数。

.. code-block:: javascript
    :caption: 查看 K 线序列中第一个柱子的值

    var k0 = kseq[0]; 
    // 第一个柱子的值

.. code-block:: javascript
    :caption: 查看 K 线序列中最后一个柱子的值

    var k0 = kseq[-1]; 
    // 等价于
    var k0 = kseq[199]; 

.. code-block:: javascript
    :caption: 每个柱子的数据结构示意

    k0 = {
        datetime: 1521529197000000000, // UnixNano 时间
        open: 51450, // 开
        high: 51450, // 高
        low: 51440, // 低
        close: 51450, // 收
        volume: 18, // 成交量
        open_oi: 295736, // 起始持仓量
        close_oi: 295739 // 结束持仓量
    }

一个完整的示例
--------------------------------------------------------------------

.. literalinclude:: ../../../../../sdk/src/example.kline.html
    :language: html
    :linenos:
