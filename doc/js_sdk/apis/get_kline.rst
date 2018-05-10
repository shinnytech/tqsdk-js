.. _api_get_kline:

获取指定 K 线序列 - GET_KLINE
====================================================================

.. js:function:: GET_KLINE(config)

    获取指定 K 线序列

    :param object config: K 线序列参数。
    :returns: 返回 K 线对象。

参数说明
--------------------------------------------------------------------

======== ================ ================================================
params   default          note
======== ================ ================================================
kline_id 随机字符串         默认为一个 8 位长的随机字符串
-------- ---------------- ------------------------------------------------
symbol                    必填，合约 symbol。:ref:`about_symbol`
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
    :caption: 获取一个 K 线序列对象

    const TQ = new TQSDK();
    var kseq = TQ.GET_KLINE({
        kline_id: 'my_kline', // 若没有指定值，默认为一个 8 位长的随机字符串，随机字符串不会重复
        symbol: 'SHFE.cu1805',
        duration: 10, // 10 秒线
        width: 200, // 若没有指定值，默认设定为 100
    });

2. 使用 K 线序列

.. code-block:: javascript
    :caption: 查看 K 线最后一个柱子的 id

    kseq.last_id // 3550

.. code-block:: javascript
    :caption: 查看 K 线序列某个字段的序列

    var open = kseq.open;  // 开盘价
    // 返回一个指向 K 线开盘价序列对象，若数据还没从服务器返回，则对应位置为 undefined

    var datetime = kseq.datetime; // UnixNano 时间
    var high = kseq.high; // 最高价
    var low = kseq.low; // 最低价
    var close = kseq.close; // 收盘价
    var volume = kseq.volume; // 成交量
    var open_oi = kseq.open_oi; // 起始持仓量
    var close_oi = kseq.close_oi; // 结束持仓量

.. code-block:: javascript
    :caption: 查看 K 线最后一个柱子

    var k = kseq[kseq.last_id]; // 最后一根 K 线
    k.open // 3330 最后一根 K 线的开盘价
    k.high // 3368 最后一根 K 线的最高价

    var k = kseq[kseq.last_id - 1]; // 倒数第二根 K 线
    k.open // 倒数第二根 K 线的开盘价
    k.high // 倒数第二根 K 线的最高价

.. code-block:: javascript
    :caption: 查看 K 线最后一个柱子

    kseq.open[kseq.last_id] // 3330 最后一根 K 线的开盘价
    kseq.high[kseq.last_id] // 3368 最后一根 K 线的最高价

以上两种写法是等价的。K 线序列对象支持像数组一样用下标访问，下标从 0 开始到 kseq.last_id。

.. code-block:: javascript
    :caption: 每个柱子的数据结构示意

    k = {
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
