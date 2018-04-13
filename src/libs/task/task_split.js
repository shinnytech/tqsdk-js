function* TaskSplit(params) {
    var {exchange_id, instrument_id} = ParseSymbol(params.symbol);
    // 价格设定为对手价格
    var price_field = (params.direction === 'SELL') ? 'bid_price1' : 'ask_price1' ;

    var order_params = {
        exchange_id: exchange_id,
        instrument_id: instrument_id,
        direction: params.direction,
        offset: params.offset ? params.offset :'OPEN',
    };
    
    var quote = TQ.GET_QUOTE(params.symbol);
    var orders = []; // 记录这个 Task 下的单

    while (true) {
        var pending_volume = 0; // 挂单手数
        var traded_sum = 0; // 已成交的总金额
        var traded_volume = 0; // 已成交的总手数

        for (var order of orders) {
            // 已撤单且未成交的不考虑
            if (order.status == 'FINISHED' && order.volume_orign == order.volume_left) continue;
            var vol = order.volume_orign - order.volume_left;
            traded_volume += vol;
            pending_volume += order.volume_left;
            traded_sum += order.limit_price * vol;
        }

        if (params.all_volume - traded_volume == 0) break; // Task结束
        if (quote[price_field] <= params.max_price && quote[price_field] >= params.min_price) {
            order_params.volume = Math.min(params.max_one_volume, params.all_volume - traded_volume) - pending_volume; // 设置手数
            if (order_params.volume > 0) {
                order_params.limit_price = quote[price_field]; // 设置价格
                orders.push(TQ.INSERT_ORDER(order_params)); // 记录这个 Task 下的单
            }
        }

        var result = yield {
            PRICE_CHANGED: function () {
                return quote[price_field] !== order_params.limit_price 
            }
        }

        for (var order of orders) {
            if (order.status == 'FINISHED' && order.exchange_order_id == '') return;
        }

        if (result.PRICE_CHANGED) {
            // 撤单
            for (var order of orders) {
                if (order.status == 'ALIVE' || order.status == "UNDEFINED") TQ.CANCEL_ORDER(order);
            }
        }
    }
    return;
}