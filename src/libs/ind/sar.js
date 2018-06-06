function* sar (C) {
    C.DEFINE({
        type: "MAIN",
        cname: "抛物线指标",
        state: "KLINE",
    });

    let n = C.PARAM(4, "N"); // 计算周期
    // let step = C.PARAM(0.02, "Step"); // 步长
    // let max = C.PARAM(0.2, "Max"); // 极值
    let step = 0.02;
    let max = 0.2;

    let sar = C.OUTS("DOT", "k", {color: YELLOW});

    let rsv = [];
    let af = 0; // 加速因子
    let uptrend = undefined;
    let isReverse = false;

    while(true) {
        let i = yield;
        if(!sar[i-1]){
            uptrend = !!(C.DS.close[i] - C.DS.close[i-n+1]);
            if(uptrend) sar[i] = LOWEST(i, C.DS.low, n);
            else sar[i] = HIGHEST(i, C.DS.high, n);
        } else if(uptrend) {
            // 上升趋势
            if (isReverse) {
                sar[i] = LOWEST(i, C.DS.low, n);
                isReverse = false;
                af = 0;
            } else {
                if(C.DS[i].high > C.DS[i-1].high){
                    af = Math.min(af + step, max);
                } else {
                    af = af == 0 ? step : af;
                }
                sar[i] = sar[i-1] + af * (C.DS[i-1].high - sar[i-1]);
                if(C.DS[i].close < sar[i]){
                    uptrend = false;
                    isReverse = true;
                }
            }
        } else {
            // 下降趋势
            if (isReverse) {
                sar[i] = HIGHEST(i, C.DS.high, n);
                isReverse = false;
                af = 0;
            } else {
                if(C.DS[i].low < C.DS[i-1].low){
                    af = Math.min(af + step, max);
                } else {
                    af = af == 0 ? step : af;
                }
                sar[i] = sar[i-1] - af * (sar[i-1] - C.DS[i-1].low);
                if(C.DS[i].close > sar[i]){
                    uptrend = true;
                    isReverse = true;
                }
            }
        }
    }
}