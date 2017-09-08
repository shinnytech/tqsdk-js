C.DEFINE({
    type: "MAIN",
    cname: "6个均线",
    memo: "一次性加入6根均线",
    state: "KLINE",
});
var n1 = C.PARAM(3, "N1");
var n2 = C.PARAM(5, "N2");
var n3 = C.PARAM(10, "N3");
var n4 = C.PARAM(20, "N4");
var n5 = C.PARAM(50, "N5");
var n6 = C.PARAM(100, "N6");
var s = C.SERIAL("CLOSE");
C.OUTS(MA(s, n1), "ma" + n1, {color: RED});
C.OUTS(MA(s, n2), "ma" + n2, {color: GREEN});
C.OUTS(MA(s, n3), "ma" + n3, {color: BLUE});
C.OUTS(MA(s, n4), "ma" + n4, {color: RED});
C.OUTS(MA(s, n5), "ma" + n5, {color: GREEN});
C.OUTS(MA(s, n6), "ma" + n6, {color: BLUE});
