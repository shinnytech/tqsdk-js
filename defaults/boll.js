function* boll(C){
    C.DEFINE({
        type: "MAIN",
        cname: "布林带",
        memo: "",
        state: "KLINE",
    });
    let n = C.PARAM(3, "N");
    let m = C.PARAM(5, "M");
    let p = C.PARAM(5, "P");
    let close = C.SERIAL("CLOSE");

    let top = C.OUTS("LINE", "top", {color: RED});
    let bottom = C.OUTS("LINE", "bottom", {color: GREEN});

    let mid = [];
    let std = [];

    while(true) {
        let i = yield;
        mid[i] = MA(i, close, n, mid);
        std[i] = STD(i, close, m, std);
        top[i] = mid[i] + p * std[i];
        bottom[i] = mid[i] - p * std[i];
    }
}
