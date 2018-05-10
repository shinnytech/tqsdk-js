.. _api_is_changing:

数据是否有更新 - IS_CHANGING
====================================================================

TQSDK 从主程序不断接收数据流, 合并在内存中，维护行情与交易数据集。

函数 IS_CHANGING 作用就是判断最后一次接受的数据包中，是否包含指定对象。

.. js:function:: IS_CHANGING(obj)

    :param object obj: 数据对象。
    :returns boolean: 返回是否更新。

用法说明
--------------------------------------------------------------------

所有从 TQSDK 中取得的数据集，都可以作为参数，判断数据对象是否有更新。

.. code-block:: javascript
    :caption: 判断 K 线序列是否有更新

    const TQ = new TQSDK();
    var kseq = TQ.GET_KLINE({ symbol: 'SHFE.cu1805', duration: 10 });
    var is_kseq_changed = TQ.IS_CHANGING(kseq);
    // true / false

.. code-block:: javascript
    :caption: 判断某个合约的行情是否有更新

    const TQ = new TQSDK();
    var quote = TQ.GET_QUOTE('SHFE.cu1805');
    var is_quote_changed = TQ.IS_CHANGING(quote);
    // true / false
