function* voi(C){
    //指标定义
    C.DEFINE({
        type: "SUB",
        cname: "成交量持仓量",
        state: "KLINE",
        yaxis: [
            {id: 0, format: "HUGE", min: 0},
            {id: 1, format: "HUGE"},
        ],
    });
    //输出序列
    let vol = C.OUTS("PCBAR", "vol", {yaxis: 0});
    let oi = C.OUTS("LINE", "oi", {color: YELLOW, yaxis: 1});
    //计算
    while(true) {
        let i = yield;
        vol[i] = C.DS.volume[i];
        oi[i] = C.DS.close_oi[i];
    }
}
