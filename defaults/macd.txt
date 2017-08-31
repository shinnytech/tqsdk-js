// DIFF : EMA(CLOSE,SHORT) - EMA(CLOSE,LONG);//短周期与长周期的收盘价的指数平滑移动平均值做差。
// DEA  : EMA(DIFF,M);//DIFF的M个周期指数平滑移动平均
// 2*(DIFF-DEA),COLORSTICK;//DIFF减DEA的2倍画柱状线
DEFINE({TYPE: IKLINE, YAXIS: YAXIS_DEFAULT});
//输入
var vshort = PARAM(20, "SHORT", {MIN: 5, STEP: 5});
var vlong = PARAM(35, "LONG", {MIN: 5, STEP: 5});
var vm = PARAM(10, "M", {MIN: 5, STEP: 5});
//计算
var sclose = SERIAL("CLOSE");
var diff = SUB(EMA(sclose, vshort), EMA(sclose, vlong));
var dea = EMA(diff, vm);
var bar = 2 * (diff - dea);
//输出
OUT_LINE(diff, "diff", {COLOR: RED});
OUT_LINE(dea, "dea", {COLOR: BLUE, WIDTH: 2});
OUT_BAR(bar, "bar", {COLOR: RED});