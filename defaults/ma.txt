DEFINE({TYPE: IKLINE, YAXIS: YAXIS_DEFAULT});
var n = PARAM(10, "N");
var v = MA(SERIAL("close"), n);
OUT_LINE(v, "ma", {COLOR: RED, WIDTH: 3});