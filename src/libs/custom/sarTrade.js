function* sarTrade (C) {
    C.DEFINE({
        type: "MAIN",
        cname: "抛物线指标策略",
        state: "KLINE",
    });
    let n0 = C.PARAM(10, "回算反向SAR的K线个数");
    let r0 = C.PARAM(2.5, "建仓最低盈亏比", {type: "DOUBLE"});
    let b_buy_vol = C.PARAM(1, "小周期多单手数");
    let b_sell_vol = C.PARAM(2, "小周期空单手数");
    let p0 = C.PARAM(5, "小周期建仓优化参数");
    let c_dur = C.PARAM(300, "大周期");
    let c_buy_vol = C.PARAM(3, "大周期多单手数");
    let c_sell_vol = C.PARAM(4, "大周期空单手数");
    let q0 = C.PARAM(12, "大周期建仓优化参数");

    let records_buy = []; // 开仓交易记录
    let records_sell = [];
    let quote = TQ.GET_QUOTE(C.symbol);
    let position = null;

    let b_ind_sar = TQ.NEW_INDICATOR_INSTANCE(self.sarFsar, C.symbol, C.dur_nano / 1e9);
    let c_ind_sar = TQ.NEW_INDICATOR_INSTANCE(self.sarFsar, C.symbol, c_dur);
    let Cd = {buy: -1, sell: -1};
    let max_vol_long = Math.max(b_buy_vol, c_buy_vol); // 多仓最大手数
    let max_vol_short = Math.max(b_sell_vol, c_sell_vol); // 空仓最大手数

    function fixed(num, n=2){
        return num ? Number(num.toFixed(n)) : num;
    }
    function cal_R(sar_sell, sar_buy, price){
        return fixed(Math.abs((sar_sell - price)/(price - sar_buy)), 4); // 计算盈亏比
    }
    function cal_Cd(price, sar, r0){
        return fixed(price + r0 * (price - sar)); // 计算止盈线
    }

    function getState(i, serial){
        let sar = serial.outs.Sar(-1) ? serial.outs.Sar(-1)[0] : 0;
        let fsar = serial.outs.FSar(-1) ? serial.outs.FSar(-1) : sar;
        return [serial.outs.S0(-1), serial.outs.S1(-1), fsar];
    }

    function lock_order(i, dir){
        if(!position) position = TQ.GET_POSITION(C.symbol);
        let vol = dir === 'BUY' ? position.volume_short- position.volume_long : position.volume_long - position.volume_short;
        vol = dir === 'BUY' ? Math.min(vol, max_vol_long) : Math.min(vol, max_vol_short);
        if (vol > 0){
            let order = C.ORDER(i, dir, "OPEN", vol);
            setTimeout(function(){
                if(order && order.order_id){
                    TQ.CANCEL_ORDER(order);
                }
            }, 1000);
        }
    }

    function open_order(i, dir, vol){
        if((dir === 'BUY' && records_buy[i]) || (dir === 'SELL' && records_sell[i])) return;
        if(!position) position = TQ.GET_POSITION(C.symbol);
        let rest_volume_long = Math.min(vol, max_vol_long) - position.volume_long - position.order_volume_buy_open;
        let rest_volume_short = Math.min(vol, max_vol_short) - position.volume_short - position.order_volume_sell_open;
        let order = null;
        if(dir === 'SELL' && rest_volume_short > 0){
            if (rest_volume_short < vol) vol = rest_volume_short;
            order = C.ORDER(i, "SELL", "OPEN", vol);
            if(vol > 0) records_buy[i] = true;
        }
        if(dir == 'BUY' && rest_volume_long > 0){
            if (rest_volume_long < vol) vol = rest_volume_long;
            order = C.ORDER(i, "BUY", "OPEN", vol);
            if(vol > 0) records_sell[i] = true;
        }
        setTimeout(function(){
            if(order && order.order_id){
                TQ.CANCEL_ORDER(order);
            }
        }, 1000);
    }

    function close_order(i, dir){
        if(!position) position = TQ.GET_POSITION(C.symbol);
        if(dir === 'SELL'){
            C.ORDER(i, "SELL", "CLOSE", position.volume_long - position.order_volume_sell_close - position.order_volume_sell_closetoday);
        } else {
            C.ORDER(i, "BUY", "CLOSE", position.volume_short - position.order_volume_buy_close - position.order_volume_buy_closetoday);
        }
    }
    //C.TRADE_OC_CYCLE(true);
    C.unit_id = 'MAIN';

    function checkOpen(bstate1, cstate1, bfsar, cfsar){
        let result = 0;
        if((bstate1 === 'UP' && cstate1 === 'DOWN') || (bstate1 === 'DOWN' && cstate1 === 'UP')){
            let [short_sar, long_sar] = cstate1 === 'DOWN' ? [cfsar, bfsar] : [bfsar, cfsar];
            let [short_vol, long_vol] = cstate1 === 'DOWN' ? [c_sell_vol, b_buy_vol] : [b_sell_vol, c_buy_vol];
            let R_Buy = cal_R(short_sar, long_sar, quote.ask_price1);
            let R_Sell = cal_R(short_sar, long_sar, quote.bid_price1);
            if (R_Buy > r0 && quote.ask_price1 - long_sar <= p0){
                result = long_vol;
                Cd.buy = cal_Cd(quote.ask_price1, long_sar, r0);
            }
            if (R_Sell <= 1/r0 && short_sar - quote.bid_price1 <= q0){
                result = -short_vol;
                Cd.sell = cal_Cd(quote.bid_price1, short_sar, r0);
            }
        } else if (bstate1 === 'UP' && cstate1 === 'UP'){
            if(quote.ask_price1 - bfsar <= p0) {
                result = b_buy_vol;
                Cd.Buy = -1;
            }
        } else if (bstate1 === 'DOWN' && cstate1 === 'DOWN'){
            if(bfsar - quote.bid_price1 <= p0) {
                result = -b_sell_vol;
                Cd.sell = -1;
            }
        }
        return result;
    }

    function checkClose(bstate, cstate){
        let result = null;
        if (bstate === 'UP_CROSS' || (bstate === 'DOWN' && cstate === 'UP_CROSS')) {
            result = 'SELL';
        } else if (bstate === 'DOWN_CROSS' || (bstate === 'UP' && cstate === 'DOWN_CROSS' )) {
            result = 'BUY';
        } else if((bstate === 'UP' && cstate === 'DOWN') || (bstate === 'DOWN' && cstate === 'UP')){
            if(Cd.buy > -1 && quote.bid_price1 >= Cd.buy){
                result = 'SELL';
                Cd.buy = -1;
            }
            if(Cd.sell > -1 && quote.ask_price1 <= Cd.sell){
                result = 'BUY';
                Cd.sell = -1;
            }
        }
        return result;
    }

    while(true) {
        let i = yield;
        let [bstate, bstate1, bfsar] = getState(i, b_ind_sar);
        let [cstate, cstate1, cfsar] = getState(null, c_ind_sar);
        if (i < C.DS.last_id) continue;
        let close = checkClose(bstate, cstate); // "BUY" | "SELL
        let open = checkOpen(bstate1, cstate1, bfsar, cfsar); // 正数买，负数卖
        if(close === 'BUY'){
            if(open >= 0){
                close_order(i, "BUY");
                open_order(i, 'BUY', Math.abs(open));
            } else {
                lock_order(i, 'BUY');
            }
        } else if(close === 'SELL'){
            if(open <= 0){
                close_order(i, "SELL");
                open_order(i, 'SELL', Math.abs(open));
            } else {
                lock_order(i, 'SELL');
            }
        } else if(open !== 0) {
            close_order(i, open > 0 ? 'BUY' : 'SELL');
            open_order(i, open > 0 ? 'BUY' : 'SELL', Math.abs(open));
        }
    }
}