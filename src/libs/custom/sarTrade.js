function* sarTrade (C) {
    C.DEFINE({
        type: "MAIN",
        cname: "抛物线指标策略",
        state: "KLINE",
    });

    let n = C.PARAM(4, "N"); // 计算周期
    let step = C.PARAM(0.02, "Step", {type: "DOUBLE"}); // 步长
    let max = C.PARAM(0.2, "Max", {type: "DOUBLE"}); // 极值

    let n0 = C.PARAM(10, "回算反向SAR的K线个数");
    let r0 = C.PARAM(2.5, "建仓最低盈亏比");

    let b_buy_vol = C.PARAM(1, "小周期多单手数");
    let b_sell_vol = C.PARAM(2, "小周期空单手数");
    let p0 = C.PARAM(5, "小周期建仓优化参数");

    let c_dur = C.PARAM(300, "大周期");
    let c_buy_vol = C.PARAM(3, "大周期多单手数");
    let c_sell_vol = C.PARAM(4, "大周期空单手数");
    let q0 = C.PARAM(12, "大周期建仓优化参数");

    let sar = C.OUTS("COLORDOT", "Sar");
    let fsar = C.OUTS("DOT", "FSar", {color: YELLOW});

    let af = 0; // 加速因子

    var quote = TQ.GET_QUOTE(C.symbol);
    var position = TQ.GET_POSITION(C.symbol);
    var c_sar = TQ.NEW_INDICATOR_INSTANCE(self.sar, C.symbol, c_dur);

    function setSar(i, isUp, val){
        sar[0][i] = val;
        if (isUp) {
            sar[1][i] = RED;
        } else {
            sar[1][i] = GREEN;
        }
    }

    function setFSar(i){
        if (sar[1][i] == RED && C.DS[i].low < sar[0][i]) {
            fsar[i] = HIGHEST(i-1, C.DS.high, n0);
        }
        if(sar[1][i] == GREEN && C.DS[i].high > sar[0][i]){
            fsar[i] = LOWEST(i-1, C.DS.low, n0);
        }
    }

    function fixed(num, n=2){
        return Number(num.toFixed(n));
    }

    function getState(serial){
        var id = serial._ds.last_id;
        var res_serial = serial.outs.Sar((id-1000<0)?0:id-1000, id);
        var cur = serial.outs.Sar(id);
        var result = {
            value: 0,
            state: "NULL"
        };
        if(!cur) return result;

        result.value = cur[0];
        result.state = cur[1].toString() == '#ff0000' ? 'UP' : 'DOWN';
        if(result.state == 'UP' && serial.DS.low[id] < result.value){
            result.state = 'UP_CROSS';
        }
        if(result.state == 'DOWN' && serial.DS.high[id] > result.value){
            result.state = 'DOWN_CROSS';
        }
        return result;
    }

    // 计算盈亏比
    function cal_R(sar_sell, sar_buy, price){
        let R = (sar_sell - price)/(price - sar_buy);
        return fixed(Math.abs(R), 4);
    }

    // 计算止盈线
    function cal_Cd(price, sar, r0){
        return fixed(price + r0 * (price - sar));
    }

    function open_order(i, dir, vol){
        var volume_short = vol - position.volume_short_today - position.volume_short_his;
        var volume_long = vol - position.volume_long_today - position.volume_long_his;
        var pos = TQ.GET_UNIT_POSITION(C.unit_id, C.symbol);
        if(pos.volume_long != undefined){
            volume_long = vol - pos.volume_long - pos.order_volume_buy_open;
        }
        if(pos.volume_short != undefined){
            volume_short = vol - pos.volume_short - pos.order_volume_sell_open;
        }

        if(dir == 'SELL' && volume_short > 0){
            C.ORDER(i, "SELL", "CLOSEOPEN", volume_short);
        }
        if(dir == 'BUY' && volume_long > 0){
            C.ORDER(i, "BUY", "CLOSEOPEN", volume_long);
        }
    }

    function close_order(i, dir){
        if(dir == 'SELL'){
            C.ORDER(i, "SELL", "CLOSE", position.volume_long_today + position.volume_long_his);
        } else {
            C.ORDER(i, "BUY", "CLOSE", position.volume_short_today + position.volume_short_his);
        }

    }

    var Cd = {buy: -1, sell: -1};

    while(true) {
        let i = yield;
        if (sar[0][i]) {
            setFSar(i);
        } else {
            if (!sar[0][i - 1]) {
                if (C.DS.close[i] - C.DS.open[i] > 0){
                    setSar(i, true, LOWEST(i-1, C.DS.low, n))
                } else {
                    setSar(i, false, HIGHEST(i-1, C.DS.high, n));
                }
            } else if (sar[1][i - 1] == RED) {
                // 上一次上升趋势
                if (C.DS[i - 1].low < sar[0][i - 1]) { // 本次需要转向
                    setSar(i, false, HIGHEST(i-1, C.DS.high, n));
                    af = 0;
                } else {
                    if (C.DS[i - 1].high > C.DS[i - 2].high) {
                        af = Math.min(af + step, max);
                    } else {
                        af = af == 0 ? step : af;
                    }
                    setSar(i, true, sar[0][i - 1] + af * (C.DS[i - 1].high - sar[0][i - 1]));
                    setFSar(i);
                }
            } else {
                if (C.DS[i - 1].high > sar[0][i - 1]) {
                    setSar(i, true, LOWEST(i-1, C.DS.low, n));
                    af = 0;
                } else {
                    if (C.DS[i - 1].low < C.DS[i - 2].low) {
                        af = Math.min(af + step, max);
                    } else {
                        af = af == 0 ? step : af;
                    }
                    setSar(i, false, sar[0][i - 1] - af * (sar[0][i - 1] - C.DS[i - 1].low));
                    setFSar(i);
                }
            }
        }
        var c_state = getState(c_sar);



        if(sar[1][i] == RED){
            if (fsar[i] && c_state.state == 'UP'){
                close_order(i, "SELL");
            } else if(!fsar[i] && c_state.state == 'DOWN_CROSS') {
                close_order(i, "BUY");
            } else if(!fsar[i] && c_state.state == 'DOWN'){
                if(Cd.buy > -1 && quote.bid_price1 >= Cd.buy){
                    close_order(i, "SELL");
                    Cd.buy = -1;
                }
                if(Cd.sell > -1 && quote.ask_price1 <= Cd.sell){
                    close_order(i, "BUY");
                    Cd.sell = -1;
                }
            }

            if(fsar[i] && c_state.state == 'DOWN'){
                if(fsar[i] - quote.bid_price1 <= p0){
                    open_order(i, "SELL", c_sell_vol);
                    Cd.sell = -1;
                }
            } else if(!fsar[i] && c_state.state == 'UP') {
                if(quote.ask_price1 - sar[0][i] <= p0){
                    open_order(i, "BUY", c_buy_vol);
                    Cd.Buy = -1;
                }
            } else if(!fsar[i] && c_state.state == 'DOWN') {
                var R_Buy = cal_R(c_state.value, sar[0][i], quote.ask_price1);
                var R_Sell = cal_R(c_state.value, sar[0][i], quote.bid_price1);
                if (R_Buy > r0 && quote.ask_price1 - sar[0][i] <= p0){
                    Cd.buy = cal_Cd(quote.ask_price1, sar[0][i], r0);
                    open_order(i, "BUY", b_buy_vol);
                }
                if (R_Sell <= 1/r0 && c_state.value - quote.bid_price1 <= q0){
                    Cd.sell = cal_Cd(quote.bid_price1, c_state.value, r0);
                    open_order(i, "SELL", c_sell_vol);
                }
            }
        } else if(sar[1][i] == GREEN) {
            if (fsar[i] && c_state.state == 'DOWN'){
                close_order(i, "BUY");
            } else if(!fsar[i] && c_state.state == 'UP_CROSS') {
                close_order(i, "SELL");
            } else if(!fsar[i] && c_state.state == 'UP'){
                if(Cd.buy > -1 && quote.bid_price1 >= Cd.buy){
                    close_order(i, "SELL");
                    Cd.buy = -1;
                }
                if(Cd.sell > -1 && quote.ask_price1 <= Cd.sell){
                    close_order(i, "BUY");
                    Cd.sell = -1;
                }
            }
            if(fsar[i] && c_state.state == 'UP'){
                if(quote.ask_price1 - fsar[i] <= p0){
                    open_order(i, "BUY", c_buy_vol);
                    Cd.buy = -1;
                }
            } else if(!fsar[i] && c_state.state == 'DOWN') {
                if(sar[0][i] - quote.bid_price1 <= p0){
                    open_order(i, "SELL", c_sell_vol);
                    Cd.sell = -1;
                }
            } else if(!fsar[i] && c_state.state == 'UP') {
                var R_Buy = cal_R( sar[0][i], c_state.value, quote.ask_price1);
                var R_Sell = cal_R( sar[0][i], c_state.value, quote.bid_price1);
                if (R_Buy > r0 && quote.ask_price1 - c_state.value <= p0){
                    Cd.buy = cal_Cd(quote.ask_price1, c_state.value, r0);
                    open_order(i, "BUY", c_buy_vol);
                }
                if (R_Sell <= 1/r0 && sar[0][i] - quote.bid_price1 <= q0){
                    Cd.sell = cal_Cd(quote.bid_price1, sar[0][i], r0);
                    open_order(i, "SELL", b_sell_vol);
                }
            }
        }


    }
}