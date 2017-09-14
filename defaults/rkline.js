
function* rkline(C) {
    C.DEFINE({
        type: "SUB",
        state: "KLINE",
    });
    let open = C.SERIAL("OPEN");
    let high = C.SERIAL("HIGH");
    let low = C.SERIAL("LOW");
    let close = C.SERIAL("CLOSE");
    let [o, h, l, c] = C.OUTS("KLINE", "k", {color: RED});
    //计算
    while(true) {
        let i = yield;
        o[i] = open[i];
        h[i] = high[i];
        l[i] = low[i];
        c[i] = close[i];
    }
}
