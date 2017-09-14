function* voi(C){
    C.DEFINE({
        type: "SUB",
        cname: "成交量持仓量",
        memo: "成交量持仓量",
        state: "KLINE",
        yaxis: [
            {id: 0, format: "HUGE"},
            {id: 1, format: "HUGE"},
        ]
    });
    let s_vol = C.SERIAL("VOLUME");
    let s_oi = C.SERIAL("CLOSE_OI");
    let vol = C.OUTS("LINE", "vol", {color: RED, yaxis: 0});
    let oi = C.OUTS("LINE", "oi", {color: GREEN, yaxis: 1});
    while(true) {
        let i = yield;
        vol[i] = s_vol[i];
        oi[i] = s_oi[i];
    }
}
