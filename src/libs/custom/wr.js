function* wr(C){
    //指标定义
    C.DEFINE({
        type: "SUB",
        cname: "威廉指标",
        state: "KLINE"
    });
    let n = C.PARAM(14, "N", {min:2, max:100});

    let wr = C.OUTS("LINE", "wr", {color: WHITE});

    let highest = []; // N周期内最高价序列
    let lowest = []; // N周期内最低价序列

    //计算
    while(true) {
        let i = yield;
        highest[i] = HIGHEST(i, C.DS.high, n);
        lowest[i] = LOWEST(i, C.DS.low, n);
        if(lowest[i] - highest[i] === 0){
             wr[i] =  wr[i-1];
        } else {
            wr[i] = (highest[i] - C.DS.close[i]) / (lowest[i] - highest[i]) * 100;
        }
    }
}