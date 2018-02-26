.. _1_page:

页面对应交易
========================================

这一章主要介绍编写一个交易策略的流程和注意事项。

首先，每个页面可以一般对应一个交易策略，一个交易策略可以有若干个 Task 组成。

.. tip::
    为了方便，每个交易策略的 JavaScript 代码直接写在页面的 <script></script> 标签内部。
    当然你也可以写在独立的文件中，再通过 script 标签引入页面。

Task 之间可以是互相独立的，也可以包含子级 Task。

相互独立的 Task
----------------------------------------

.. code-block:: javascript

    function* TaskQuote(C) {
        while (true) {
            var result = yield {
                UPDATED_QUOTE: function () { return C.GET_QUOTE(UI.instrument, C.LAST_UPDATED_DATA) },
                CHANGED: C.ON_CHANGE('instrument')
            };
            var quote = C.GET_QUOTE(UI.instrument);
            UI(quote); // 更新界面
        }
    }
    
    function* TaskSplit(C) {
        var wait = yield {
            'START': C.ON_CLICK('START')
        }
        C.SET_STATE('START');

        /****** 交易逻辑代码 ******/
        return;
    }

包含子级 Task
----------------------------------------

.. code-block:: javascript

    function* TaskCombine(C) {
        var weights = C.GET_COMBINE(UI.combine_id);
        if (!weights) return;
        C.SET_STATE('START');

        var TaskList = []; // 子级 Task 列表
        for (var ins_id in weights) {
            if (!ins_id) continue;
            var volume = Math.abs(Math.round(UI.volume * weights[ins_id])); 
            if (volume > 0) {
                var [exchange_id, instrument_id] = ins_id.split('.'); 
                var direction = weights[ins_id] > 0 ? UI.direction : (UI.direction === 'SELL' ? 'BUY' : 'SELL'); 
                var offset = UI.offset; 
                var price_field = direction === 'SELL' ? 'bid_price1' : 'ask_price1'; 
                var order_param = { ins_id, exchange_id, instrument_id, direction, volume, offset, price_field };
                // 依次添加 Task 至 TaskList
                TaskList.push(START_TASK(TaskSingleOrder, order_param));
            }
        }

        var result = yield {
            SUBTASK_COMPLETED: TaskList, // 子 Task 的完成情况
            COMBINE_CHANGED: function () { C.GET_COMBINE(UI.combine_id, C.LAST_UPDATED_DATA) }, 
            USER_CLICK_STOP: C.ON_CLICK('STOP')
        };

        // 任务结束
        C.SET_STATE('STOP');
        return;
    }

    function* TaskSingleOrder(C, order_param) {
        var quote = C.GET_QUOTE(order_param.ins_id);
        var rest_volume = order_param.volume;
        while (rest_volume > 0) {
            order_param.limit_price = quote[order_param.price_field];
            var order = C.INSERT_ORDER(order_param);
            var result = yield {
                UPDATED: function () { return C.GET_ORDER(order.exchange_order_id, C.LAST_UPDATED_DATA); },
                USER_CLICK_STOP: C.ON_CLICK('STOP'),
            };
            if (order.status != "FINISHED") C.CANCEL_ORDER(order);
            rest_volume -= (order.volume_orign - order.volume_left);
            if (result.USER_CLICK_STOP) {
                C.CANCEL_ORDER(order);
                break;
            }
        }
        return;
    }

.. hint::

    yield 后面如果是 Task 对象的话，返回的内容会是 true / false 。

    如果子 Task 已经执行完毕，返回 true， 否则返回 false。

