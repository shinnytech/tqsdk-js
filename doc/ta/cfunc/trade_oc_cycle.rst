.. _trade_oc_cycle:

C.TRADE_OC_CYCLE - 是否使用开平循环模式
=======================================

C.TRADE_OC_CYCLE 函数用于设置是否强制使用开平循环模式。默认值为 false。

设置为 true，表示在未持仓情况下只会发出开仓信号, 有持仓时只会发出平仓信号。

设置为 false，有持仓时也可以发出开仓信号。

Example
--------------------------------------------------
.. code-block:: javascript

    function* my_ind(C) {
        C.DEFINE({
            type: "MAIN",
        });

        //输出序列
        let out = C.OUTS("LINE", "out", {color: RED});

        C.TRADE_OC_CYCLE(true); // 强制使用开平模式

        while(true){
            let i = yield;
            // 计算代码
        }
    }
