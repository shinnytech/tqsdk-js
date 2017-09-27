function* kdj(C){
    C.DEFINE({
        type: "SUB",
        cname: "KDJ",
        memo: "",
        state: "KLINE",
    });
    let n = C.PARAM(3, "N");
    let m1 = C.PARAM(5, "M1");
    let m2 = C.PARAM(5, "M2");
    let close = C.SERIAL("CLOSE");
    let high = C.SERIAL("HIGH");
    let low = C.SERIAL("LOW");

    let k = C.OUTS("LINE", "k", {color: RED});
    let d = C.OUTS("LINE", "d", {color: GREEN});
    let j = C.OUTS("LINE", "j", {color: YELLOW});

    let rsv = [];

    while(true) {
        let i = yield;
        let hv = HIGHEST(i, high, n);
        let lv = LOWEST(i, low, n);
        rsv[i] = (hv == lv) ? 0 : (close[i] - lv) / (hv - lv) * 100;
        k[i] = SMA(i, rsv, m1, 1, k);
        d[i] = SMA(i, k, m2, 1, d);
        j[i] = 3*k[i] -2*d[i];
    }
}
