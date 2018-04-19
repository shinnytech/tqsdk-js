function* macd(C) {
    //指标定义
    C.DEFINE({
        type: "SUB",
        cname: "MACD",
        state: "KLINE",
        yaxis: [
            {id: 0, mid: 0, format: "NUMBER2"},
        ]
    });
    //参数
    let vshort = C.PARAM(20, "SHORT", {min: 1, memo:"短周期"});
    let vlong = C.PARAM(35, "LONG", {min: 2, memo:"长周期"});
    let vm = C.PARAM(10, "M", {min: 1});
    //输出序列
    let diff = C.OUTS("LINE", "diff", {color: WHITE});
    let dea = C.OUTS("LINE", "dea", {color: YELLOW, width: 1});
    let bar = C.OUTS("RGBAR", "bar");
    //临时序列
    let eshort = [];
    let elong = [];
    //计算
    while(true) {
        let i = yield;
        eshort[i] = EMA(i, C.DS.close, vshort, eshort);
        elong[i] = EMA(i, C.DS.close, vlong, elong);
        diff[i] = eshort[i] - elong[i];
        dea[i] = EMA(i, diff, vm, dea);
        bar[i] = 2 * (diff[i] - dea[i]);
    }
}