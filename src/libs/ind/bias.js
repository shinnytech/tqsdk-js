function* bias(C){
    //指标定义
    C.DEFINE({
        type: "SUB",
        cname: "乘离率",
        state: "KLINE"
    });
    let n1 = C.PARAM(6, "N1", {min:1, max:100});
    let n2 = C.PARAM(12, "N2", {min:1, max:100});
    let n3 = C.PARAM(24, "N3", {min:1, max:100});

    let ma1 = [];
    let ma2 = [];
    let ma3 = [];

    let bias1 = C.OUTS("LINE", "BIAS" + n1, {color: WHITE});
    let bias2 = C.OUTS("LINE", "BIAS" + n2, {color: YELLOW});
    let bias3 = C.OUTS("LINE", "BIAS" + n3, {color: GREEN});
    //计算
    while(true) {
        let i = yield;
        ma1[i] = MA(i, C.DS.close, n1, ma1);
        bias1[i] = (C.DS.close[i] - ma1[i] ) / ma1[i] * 100;

        ma2[i] = MA(i, C.DS.close, n2, ma2);
        bias2[i] = (C.DS.close[i] - ma2[i] ) / ma2[i] * 100;

        ma3[i] = MA(i, C.DS.close, n3, ma3);
        bias3[i] = (C.DS.close[i] - ma3[i] ) / ma3[i] * 100;
    }
}
