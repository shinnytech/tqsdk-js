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
var vol = C.SERIAL("VOLUME");
var oi = C.SERIAL("close_oi");
C.OUTS(vol, "vol", {color: RED, yaxis: 0});
C.OUTS(oi, "oi", {color: GREEN, yaxis: 1});
