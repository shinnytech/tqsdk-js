.. _trade_at_close:

C.TRADE_AT_CLOSE - 是否使用开平循环模式
=======================================

C.TRADE_AT_CLOSE 函数用于设置是否只在 K 线完成时刻发出交易信号。默认值为 false。

设置为 true，只在一根K线结束的时刻，才会发出交易信号，一根 K 线最多只发出一个交易信号。

设置为 false， K 线每次变化时都可能发出交易信号，一根 K 线可以发出多个交易信号。


Example
--------------------------------------------------
.. code-block:: javascript

    function* my_ind(C) {
        C.DEFINE({
            type: "MAIN",
        });

        //输出序列
        let out = C.OUTS("LINE", "out", {color: RED});

        C.TRADE_AT_CLOSE(true); // 只在 K 线结束时，才会发出交易信号

        while(true){
            let i = yield;
            // 计算代码
        }
    }


