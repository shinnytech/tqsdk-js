C.DEFINE({
    type: "MAIN",
    cname: "布林带",
    memo: "",
    state: "KLINE",
});
var n = C.PARAM(3, "N");
var m = C.PARAM(5, "M");
var p = C.PARAM(5, "P");
var close = C.SERIAL("CLOSE");

var mid = MA(close, n);
var tmp = STD(close, m);
var top = (i) => mid(i) + p * tmp(i);
var bottom = (i) => mid(i) - p * tmp(i);

C.OUTS(top, "top", {color: RED});
C.OUTS(bottom, "bottom", {color: GREEN});
