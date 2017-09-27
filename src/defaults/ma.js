function* ma(C){
    C.DEFINE({
        type: "MAIN",
        cname: "6个均线",
        memo: "一次性加入6根均线",
        state: "KLINE",
    });
    let n1 = C.PARAM(3, "N1");
    let n2 = C.PARAM(5, "N2");
    let n3 = C.PARAM(10, "N3");
    let n4 = C.PARAM(20, "N4");
    let n5 = C.PARAM(50, "N5");
    let n6 = C.PARAM(100, "N6");
    let s = C.SERIAL("CLOSE");

    let s1 = C.OUTS("LINE", "ma" + n1, {color: RED});
    let s2 = C.OUTS("LINE", "ma" + n2, {color: GREEN});
    let s3 = C.OUTS("LINE", "ma" + n3, {color: BLUE});
    let s4 = C.OUTS("LINE", "ma" + n4, {color: RED});
    let s5 = C.OUTS("LINE", "ma" + n5, {color: GREEN});
    let s6 = C.OUTS("LINE", "ma" + n6, {color: BLUE});
    while(true) {
        let i = yield;
        s1[i] = MA(i, s, n1, s1);
        s2[i] = MA(i, s, n2, s2);
        s3[i] = MA(i, s, n3, s3);
        s4[i] = MA(i, s, n4, s4);
        s5[i] = MA(i, s, n5, s5);
        s6[i] = MA(i, s, n6, s6);
    }
}
