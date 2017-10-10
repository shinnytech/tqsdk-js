function* ma(C){
    //指标定义
    C.DEFINE({
        type: "MAIN",
        cname: "均线组",
        state: "KLINE",
    });
    //参数
    let n1 = C.PARAM(3, "N1");
    let n2 = C.PARAM(5, "N2");
    let n3 = C.PARAM(10, "N3");
    let n4 = C.PARAM(20, "N4");
    //输入序列
    let s = C.SERIAL("CLOSE");
    //输出序列
    let s1 = C.OUTS("LINE", "ma" + n1, {color: RED});
    let s2 = C.OUTS("LINE", "ma" + n2, {color: GREEN});
    let s3 = C.OUTS("LINE", "ma" + n3, {color: BLUE});
    let s4 = C.OUTS("LINE", "ma" + n4, {color: RED});
    //计算
    while(true) {
        let i = yield;
        s1[i] = MA(i, s, n1, s1);
        s2[i] = MA(i, s, n2, s2);
        s3[i] = MA(i, s, n3, s3);
        s4[i] = MA(i, s, n4, s4);
    }
}
