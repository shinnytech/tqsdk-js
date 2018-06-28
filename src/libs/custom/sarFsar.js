function* sarFsar (C) {
    C.DEFINE({
        type: "MAIN",
        cname: "抛物线指标",
        state: "KLINE",
    });

    let n0 = C.PARAM(10, "N0"); // 额外首次穿破采用的周期
    let n = C.PARAM(4, "N", {memo: "计算周期"}); // 计算周期
    let step = C.PARAM(0.02, "Step", {type: "DOUBLE"}); // 步长
    let max = C.PARAM(0.2, "Max", {type: "DOUBLE"}); // 极值

    var ind_sar = TQ.NEW_INDICATOR_INSTANCE(self.sar, C.symbol, C.dur_nano / 1e9, {
        "N": n,
        "Step": step,
        "Max": max
    });

    let sar = C.OUTS("COLORDOT", "Sar");
    let fsar = C.OUTS("DOT", "FSar", {color: YELLOW});

    while(true) {
        let i = yield;
        let cur = ind_sar.outs.Sar(i);
        sar[0][i] = cur[0];
        sar[1][i] = cur[1];
        if (cur[1] == RED && C.DS[i].low < cur[0]){
            fsar[i] = HIGHEST(i-1, C.DS.high, n0);
        }
        if (cur[1] == GREEN && C.DS[i].high > cur[0]) {
            fsar[i] = LOWEST(i - 1, C.DS.low, n0);
        }
    }
}