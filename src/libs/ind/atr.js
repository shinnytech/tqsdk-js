function* atr(C){
    //指标定义
    C.DEFINE({
        type: "SUB",
        cname: "真实波幅",
        state: "KLINE"
    });
    let n = C.PARAM(26, "N", {min:1, max:300});

    let tr = C.OUTS("LINE", "TR", {color: WHITE});
    let atr = C.OUTS("LINE", "ATR", {color: YELLOW});
    //计算
    while(true) {
        let i = yield;
        let h = C.DS.high[i];
        let l = C.DS.low[i];
        let last_c = C.DS.close[i-1];
        tr[i] = MAX( h-l, Math.abs(last_c-h), Math.abs(last_c-l));
        atr[i] = MA(i, tr, n, atr);
    }
}
