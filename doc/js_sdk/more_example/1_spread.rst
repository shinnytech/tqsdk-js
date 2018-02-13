.. _1_spread:

价差交易策略
=======================================

策略说明
---------------------------------------
价差交易，又叫套利交易，是一种通过相关的期货合约或者期现品种等商品、金融产品及它们的衍生品之间的价差波动来获取利润的交易方法。

这里价差交易主要指利用期货合约价格之间不合理关系进行套利交易（Spread Trading）。

在页面上填入 A、B 两个合约，期望的买开卖平和卖开买平的价差、手数。

单击开始按钮后，当前价格处显示买入价差和卖出价差。

价差交易策略分为两个 Task，第一个 TaskQuote 用来显示两个合约的价差，第二个 TaskSpread 用来实现下单交易的策略。交易买卖策略如下：

+ 合约A买1价 - 合约B卖1价 <= 买开价差，买开合约A，卖开合约B
+ 合约A卖1价 - 合约B买1价 >= 卖平价差，卖平合约A，买平合约B
+ 合约A卖1价 - 合约B买1价 >= 卖开价差，卖开合约A，买开合约B
+ 合约A买1价 - 合约B卖1价 <= 买平价差，买平合约A，卖平合约B

点击停止按钮时，可以暂停任务，并且撤掉已经发出且为成交的挂单。

源码
---------------------------------------

.. code-block:: javascript

    function* TaskSpread(C) {
        var quoteA = C.GET_QUOTE(UI.insA);
        var quoteB = C.GET_QUOTE(UI.insB);
        if (!quoteA || !quoteB) return;

        C.SET_STATE('START');
        var short_volume = 0, long_volume = 0;
        // 参数设定
        var [exchange_id_a, instrument_id_a] = UI.insA.split('.');
        var [exchange_id_b, instrument_id_b] = UI.insB.split('.');
        var volume = parseInt(UI.volume);
        var order_a = { ins_id: UI.insA, exchange_id: exchange_id_a, instrument_id: instrument_id_a, volume: volume };
        var order_b = { ins_id: UI.insB, exchange_id: exchange_id_b, instrument_id: instrument_id_b, volume: volume };
        var buy_open = { direction: 'BUY', offset: 'OPEN' };
        var sell_close = { direction: 'SELL', offset: 'CLOSE' };
        var sell_open = { direction: 'SELL', offset: 'OPEN' };
        var buy_close = { direction: 'BUY', offset: 'CLOSE' };

        while (true) {
            var result = yield {
                PRARM: function () {
                    if (quoteA.ask_price1 - quoteB.bid_price1 <= UI.price_buy_open && long_volume == 0) return [buy_open, sell_open];
                    if (quoteA.bid_price1 - quoteB.ask_price1 >= UI.price_sell_close && long_volume > 0) return [sell_close, buy_close];
                    if (quoteA.bid_price1 - quoteB.ask_price1 >= UI.price_sell_open && short_volume == 0) return [sell_open, buy_open];
                    if (quoteA.ask_price1 - quoteB.bid_price1 <= UI.price_buy_close && short_volume > 0) return [buy_close, sell_close];
                    return [false, false];
                },
                USER_CLICK_STOP: C.ON_CLICK('STOP')
            };
            if (result.USER_CLICK_STOP) break;

            var [param_a, param_b] = result.PRARM;
            if (param_a && param_b) {
                var task_a = START_TASK(TaskSingleOrder, Object.assign({}, order_a, param_a));
                var task_b = START_TASK(TaskSingleOrder, Object.assign({}, order_b, param_b));
                var result = yield {
                    SUBTASK: [task_a, task_b],
                }
                // 全部task结束
                if (result.SUBTASK.reduce((a, b) => a && b)) {
                    if (param_a == buy_open && long_volume == 0) { long_volume = volume; }
                    if (param_a == sell_close && long_volume > 0) { long_volume = 0; }
                    if (param_a == sell_open && short_volume == 0) { short_volume = volume; }
                    if (param_a == buy_close && short_volume > 0) { short_volume = 0; }
                }
            }
        }
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
            // 设定为当前对手价
            order_param.limit_price = (order_param.direction === 'SELL') ? quote.bid_price1 : quote.ask_price1;
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