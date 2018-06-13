function* sar (C) {
    C.DEFINE({
        type: "MAIN",
        cname: "抛物线指标",
        state: "KLINE",
    });

    let n = C.PARAM(4, "N"); // 计算周期
    let step = C.PARAM(0.02, "Step", {type: "DOUBLE"}); // 步长
    let max = C.PARAM(0.2, "Max", {type: "DOUBLE"}); // 极值

    let sar = C.OUTS("COLORDOT", "Sar");

    let af = 0; // 加速因子
    let uptrend = undefined;
    let isReverse = false;

    function setSar(i, isUp, val){
        sar[0][i] = val;
        if (isUp) {
            sar[1][i] = RED;
        } else {
            sar[1][i] = GREEN;
        }
    }

    while(true) {
        let i = yield;
        if(!sar[0][i-1]){
            uptrend = !!(C.DS.close[i] - C.DS.close[i-n+1]);
            if(uptrend){
                setSar(i, uptrend, LOWEST(i, C.DS.low, n));
            } else {
                setSar(i, uptrend, HIGHEST(i, C.DS.high, n));
            }
        } else if(uptrend) {
            // 上升趋势
            if (isReverse) {
                setSar(i, uptrend, LOWEST(i, C.DS.low, n));
                isReverse = false;
                af = 0;
            } else {
                if(C.DS[i].high > C.DS[i-1].high){
                    af = Math.min(af + step, max);
                } else {
                    af = af == 0 ? step : af;
                }
                setSar(i, uptrend, sar[0][i-1] + af * (C.DS[i-1].high - sar[0][i-1]));
                if(C.DS[i].close < sar[0][i]){
                    uptrend = false;
                    isReverse = true;
                }
            }
        } else {
            // 下降趋势
            if (isReverse) {
                setSar(i, uptrend, HIGHEST(i, C.DS.high, n));
                isReverse = false;
                af = 0;
            } else {
                if(C.DS[i].low < C.DS[i-1].low){
                    af = Math.min(af + step, max);
                } else {
                    af = af == 0 ? step : af;
                }
                setSar(i, uptrend, sar[0][i-1] - af * (sar[0][i-1] - C.DS[i-1].low));
                if(C.DS[i].close > sar[0][i]){
                    uptrend = true;
                    isReverse = true;
                }
            }
        }
    }
}