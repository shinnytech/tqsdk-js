.. _api_new_indicator_instance:

指标实例 - NEW_INDICATOR_INSTANCE
====================================================================

.. js:function:: NEW_INDICATOR_INSTANCE(ind_func, symbol, dur_sec, params)

    新建某个指标类的计算实例

    :param function ind_class_name: 指标类函数名
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

    // 指标实例对应的 K 线序列
    let kseq = ins.DS;
    let last_id = ins.DS.last_id;

    // 输出序列
    let m = ind.outs.ma5(last_id); // 最后一根 K 线的 5 个周期的均值
    let ml = ind.outs.ma5(last_id-5, last_id); // 最后 6 根 K 线的 5 个周期的均值

计算实例的输出序列可以接受两种形式的参数：

+ number - id，返回指定 id 号的序列结果
+ number, number - start_id, end_id, 返回长度为 end_id - start_id + 1 的数组, 内容是从 start_id 至 end_id 的序列计算结果。
