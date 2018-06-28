function* sar (C) {
    C.DEFINE({
        type: "MAIN",
        cname: "抛物线指标",
        state: "KLINE",
    });
    let n = C.PARAM(4, "N", {memo: "计算周期"}); // 计算周期
    let step = C.PARAM(0.02, "Step", {type: "DOUBLE"}); // 步长
    let max = C.PARAM(0.2, "Max", {type: "DOUBLE"}); // 极值

    let sar = C.OUTS("COLORDOT", "Sar");

    let af = []; // 加速因子
    let trends = []; // 1 up -1 down
    let ep = [];

    function setSar(i, isUp, val){
        sar[0][i] = val;
        sar[1][i] = isUp ? RED : GREEN;
        trends[i] = isUp ? 1 : -1;
    }

    while(true) {
        let i = yield;
        if(!sar[0][i - 1]){
            let uptrend = C.DS.close[i] - C.DS.open[i];
            if(uptrend > 0) {
                setSar(i, true, LOWEST(i-1, C.DS.low, n));
            } else {
                setSar(i, false, HIGHEST(i-1, C.DS.high, n));
            }
            af[i-1] = 0;
        }
        if(!sar[0][i]) {
            if(trends[i] === trends[i-1]) {
                let temp = sar[0][i - 1] + af[i-1] * (ep[i-1] - sar[0][i - 1]);
                setSar(i, trends[i] === 1, temp);
            } else {
                if(trends[i] === 1){
                    setSar(i, true, LOWEST(i-1, C.DS.low, n));
                } else {
                    setSar(i, false, HIGHEST(i-1, C.DS.high, n));
                }
            }
        }
        if(trends[i] === 1){
            if (sar[0][i] > C.DS.low[i]) {
                // 转向跌
                ep[i] = C.DS.low[i]; //LOWEST(i, C.DS.low, n);
                af[i] = step;
                trends[i+1] = -1;
            } else {
                ep[i] = C.DS.high[i]; //HIGHEST(i, C.DS.high, n);
                af[i] = ep[i] > HIGHEST(i-1, C.DS.high, n-1) ? Math.min(af[i-1] + step, max) : af[i-1];
                trends[i+1] = 1;
            }
        } else {
            if (sar[0][i] < C.DS.high[i]) {
                ep[i] = C.DS.high[i]; //HIGHEST(i, C.DS.low, n);
                af[i] = step;
                trends[i+1] = 1;
            } else {
                ep[i] = C.DS.low[i]; //LOWEST(i, C.DS.low, n);
                af[i] = ep[i] < LOWEST(i-1, C.DS.low, n-1) ? Math.min(af[i-1] + step, max) : af[i-1];
                trends[i+1] = -1;
            }
        }
    }
}