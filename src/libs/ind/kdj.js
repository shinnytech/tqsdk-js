function* kdj(C){
    //指标定义
    C.DEFINE({
        type: "SUB",
        cname: "KDJ",
        state: "KLINE",
    });
    //参数
    let n = C.PARAM(9, "N");
    let m1 = C.PARAM(3, "M1");
    let m2 = C.PARAM(3, "M2");
    //输出序列
    let k = C.OUTS("LINE", "k", {color: RED});
    let d = C.OUTS("LINE", "d", {color: GREEN});
    let j = C.OUTS("LINE", "j", {color: YELLOW});
    //临时序列
    let rsv = [];
    //计算
    while(true) {
        let i = yield;
        let hv = HIGHEST(i, C.DS.high, n);
        let lv = LOWEST(i, C.DS.low, n);
        rsv[i] = (hv == lv) ? 0 : (C.DS.close[i] - lv) / (hv - lv) * 100;
        k[i] = SMA(i, rsv, m1, 1, k);
        d[i] = SMA(i, k, m2, 1, d);
        j[i] = 3*k[i] -2*d[i];
    }
}