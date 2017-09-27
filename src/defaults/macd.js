function* macd(C) {
    // DIFF : EMA(CLOSE,SHORT) - EMA(CLOSE,LONG);//短周期与长周期的收盘价的指数平滑移动平均值做差。
    // DEA  : EMA(DIFF,M);//DIFF的M个周期指数平滑移动平均
    // 2*(DIFF-DEA),COLORSTICK;//DIFF减DEA的2倍画柱状线
    C.DEFINE({
        type: "SUB",
        cname: "MACD",
        state: "KLINE",
        yaxis: [
            {id: 0, mid: 0, format: "NUMBER2"},
        ]
    });
    //参数
    let vshort = C.PARAM(20, "SHORT", {MIN: 5, STEP: 5});
    let vlong = C.PARAM(35, "LONG", {MIN: 5, STEP: 5});
    let vm = C.PARAM(10, "M", {MIN: 5, STEP: 5});
    //输入
    let sclose = C.SERIAL("CLOSE");
    //输出
    let diff = C.OUTS("LINE", "diff", {color: RED});
    let dea = C.OUTS("LINE", "dea", {color: BLUE, width: 2});
    let bar = C.OUTS("BAR", "bar", {color: RED});
    //临时序列
    let eshort = [];
    let elong = [];
    //计算
    while(true) {
        let i = yield;
        eshort[i] = EMA(i, sclose, vshort, eshort);
        elong[i] = EMA(i, sclose, vlong, elong);
        diff[i] = eshort[i] - elong[i];
        dea[i] = EMA(i, diff, vm, dea);
        bar[i] = 2 * (diff[i] - dea[i]);
    }
}
