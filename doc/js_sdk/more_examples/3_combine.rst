.. _combine:

自定义组合下单
=======================================

策略说明
---------------------------------------
合约系数为正数，表示与下单方向相同；合约系数为负数，表示与下单方向相反。

下单时用对手价下单，超时未成交继续追平。

挂单后若不成交且对手价已变动，则立即撤单，重新下单。

先在软件中，在自编组合页面新建自定义组合，设置一组合约及其对应的权重。

在页面选择买卖、方向和手数后，点击开始即会开始下单。


源码
---------------------------------------

.. code-block:: javascript

    function* TaskCombine(C) {
        var weights = C.GET_COMBINE(UI.combine_id);
        if (!weights) return;
        C.SET_STATE('START');

        var TaskList = [];
        for (var ins_id in weights) { // 对成分乘数表中的每一个合约, 开启一个任务去下单
            if (!ins_id) continue; // 等价于 ins_id == ''
            var volume = Math.abs(Math.round(UI.volume * weights[ins_id])); // 手数(四舍五入至整数)
            if (volume > 0) {
                var [exchange_id, instrument_id] = ins_id.split('.'); // 交易所代码，合约代码
                var direction = weights[ins_id] > 0 ? UI.direction : (UI.direction === 'SELL' ? 'BUY' : 'SELL'); // 交易方向
                var offset = UI.offset; // 交易开平
                var price_field = direction === 'SELL' ? 'bid_price1' : 'ask_price1'; // 价格字段(选择对手价的字段)
                var order_param = { ins_id, exchange_id, instrument_id, direction, volume, offset, price_field };
                TaskList.push(START_TASK(TaskSingleOrder, order_param));
            }
        }

        var result = yield {
            SUBTASK_COMPLETED: TaskList,
            COMBINE_CHANGED: function () { C.GET_COMBINE(UI.combine_id, C.LAST_UPDATED_DATA) }, //组合合约变化
            USER_CLICK_STOP: C.ON_CLICK('STOP')
        };

        // 任务结束
        C.SET_STATE('STOP');
        return;
    }

    // 修改为追单模式
    function* TaskSingleOrder(C, order_param) {
        var quote = C.GET_QUOTE(order_param.ins_id);
        var rest_volume = order_param.volume;
        // 设定为当前对手价
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
