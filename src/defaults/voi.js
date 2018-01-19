function* voi_copy(C){
    //指标定义
    C.DEFINE({
        type: "SUB",
        cname: "成交量持仓量",
        state: "KLINE",
        yaxis: [
            {id: 0, format: "HUGE"},
            {id: 1, format: "HUGE"},
        ],
    });
    //输入序列
    let s_vol = C.SERIAL("VOLUME");
    let s_oi = C.SERIAL("CLOSE_OI");
    //输出序列
    let vol = C.OUTS("PCBAR", "vol", {yaxis: 0});
    let oi = C.OUTS("LINE", "oi", {color: YELLOW, yaxis: 1});
    //计算
    while(true) {
        let i = yield;
        vol[i] = s_vol[i];
        oi[i] = s_oi[i];
    }
}
