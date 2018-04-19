function* boll(C){
    //指标定义
    C.DEFINE({
        type: "MAIN",
        cname: "布林带",
        state: "KLINE",
    });
    //参数
    let n = C.PARAM(3, "N", {memo: "按N个周期计算均值与标准差"});
    let p = C.PARAM(5, "P", {memo: "上下轨与中线的距离为P个标准差"});
    //输出序列
    let top = C.OUTS("LINE", "top", {color: YELLOW});
    let bottom = C.OUTS("LINE", "bottom", {color: LIGHTRED});
    //临时序列
    let mid = [];
    let std = [];
    //计算
    while(true) {
        let i = yield;
        mid[i] = MA(i, C.DS.close, n, mid);
        std[i] = STDEV(i, C.DS.close, n, std);
        top[i] = mid[i] + p * std[i];
        bottom[i] = mid[i] - p * std[i];
    }
}