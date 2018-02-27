.. _2_split:

大单拆分策略
=======================================

策略说明
---------------------------------------

买入的报单价总是在买 1 价，卖出的报单价总是在卖 1 价。

下单手数为最大单笔手数，最后剩余手数小于最大单笔手数时，下单手数为最后剩余的手数。

挂单后若不成交且挂盘价已变动，则立即撤单。

挂单若成交，则补平挂单手数至最大单笔手数，最后剩余手数小于最大单笔手数时，下单手数为最后剩余的手数。

源码
---------------------------------------

.. code-block:: javascript

    function* TaskSplit(C) {
        var wait = yield {
            'START': C.ON_CLICK('START')
        }
        C.SET_STATE('START');

        var quote = C.GET_QUOTE(UI.instrument);
        if (!quote) {
            C.SET_STATE('STOP');
            STOP_TASK(task_trade);
            task_trade = START_TASK(TaskSplit);
            return;
        }

        var [exchange_id, instrument_id] = UI.instrument.split('.');
        var max_price = Math.max(UI.price_from, UI.price_to);
        var min_price = Math.min(UI.price_from, UI.price_to);
        // 价格设定为跟盘价格
        // var price_field = (UI.direction === 'SELL') ? 'ask_price1' : 'bid_price1';
        // 价格设定为对手价
        var price_field = (UI.direction === 'BUY') ? 'ask_price1' : 'bid_price1';

        var order_params = {
            exchange_id: exchange_id,
            instrument_id: instrument_id,
            direction: UI.direction,
            offset: UI.offset,
        };

        while (true) {
            var pending_volume = 0; // 挂单手数
            var traded_sum = 0; // 已成交的总金额
            var traded_volume = 0; // 已成交的总手数
            var orders = C.GET_ORDER();
            for (var order_id in orders) {
                var ord = orders[order_id];
                var vol = ord.volume_orign - ord.volume_left;
                traded_volume += vol;
                pending_volume += ord.volume_left;
                traded_sum += ord.limit_price * vol;
            }
            // 成交均价
            traded_avgprice = traded_volume == 0 ? 0 : Math.round(traded_sum / traded_volume * 100) / 100;
            UI({ traded_volume, traded_avgprice }); // 更新显示已成交手数、已成交均价
            if (UI.all_volume - traded_volume == 0) break; // Task结束
            if (quote[price_field] <= max_price && quote[price_field] >= min_price) {
                order_params.volume = Math.min(UI.max_one_volume, UI.all_volume - traded_volume) - pending_volume; // 设置手数
                if (order_params.volume > 0) {
                    order_params.limit_price = quote[price_field]; // 设置价格
                    var ord = C.INSERT_ORDER(order_params);
                }
            }
            var result = yield {
                ORDER_CHANGED: function () { return C.GET_ORDER(null, C.LAST_UPDATED_DATA); },
                PRICE_CHANGED: function () { return quote[price_field] !== order_params.limit_price },
                USER_CLICK_STOP: C.ON_CLICK('STOP')
            }
            if (result.PRICE_CHANGED || result.USER_CLICK_STOP) {
                C.CANCEL_ORDER();
                if (result.USER_CLICK_STOP) break;
            }
        }
        // 任务结束
        C.SET_STATE('STOP');
        STOP_TASK(task_trade);
        task_trade = START_TASK(TaskSplit);
        return;
    }
    START_TASK(TaskQuote);
    var task_trade = START_TASK(TaskSplit); // 执行交易任务