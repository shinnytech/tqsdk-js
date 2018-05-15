.. _C.CANCEL_ALL:

C.CANCEL_ALL - 撤单
=======================================
C.CANCEL_ALL 函数用于对每个该指标实例发送的委托单，发送撤单指令。

Example
--------------------------------------------------
.. code-block:: javascript

    function* my_ind(C) {
        C.DEFINE({
            type: "MAIN",
        });

        //输出序列
        let out = C.OUTS("LINE", "out", {color: RED});

        while(true){
            let i = yield;
            // 计算代码
            if (满足某个条件){
                C.CANCEL_ALL(); // 撤销全部委托单
            }
            // 计算代码
        }
    }

