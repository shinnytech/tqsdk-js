// DIFF : EMA(CLOSE,SHORT) - EMA(CLOSE,LONG);//短周期与长周期的收盘价的指数平滑移动平均值做差。
// DEA  : EMA(DIFF,M);//DIFF的M个周期指数平滑移动平均
// 2*(DIFF-DEA),COLORSTICK;//DIFF减DEA的2倍画柱状线
C.DEFINE({
    type: "SUB",
    cname: "MACD",
    state: "KLINE",
    yaxis: [
        {id: 0, mid: 0}
    ]
});
//输入
var vshort = C.PARAM(20, "SHORT", {MIN: 5, STEP: 5});
var vlong = C.PARAM(35, "LONG", {MIN: 5, STEP: 5});
var vm = C.PARAM(10, "M", {MIN: 5, STEP: 5});
//计算
var sclose = C.SERIAL("CLOSE");
var eshort = EMA(sclose, vshort);
var elong = EMA(sclose, vlong)
var diff = (p) => eshort(p) - elong(p);
var dea = EMA(diff, vm);
var bar = (p) => 2 * (diff(p) - dea(p));
//输出
C.OUTS(diff, "diff", {color: RED});
C.OUTS(dea, "dea", {color: BLUE, width: 2});
C.OUTS(bar, "bar", {style: "BAR", color: RED});
