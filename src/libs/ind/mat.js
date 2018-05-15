function* mat(C){
    //指标定义
    C.DEFINE({
        type: "MAIN",
        cname: "均线交易策略演示",
        state: "KLINE",
    });
    //参数
    let n1 = C.PARAM(3, "N1");  //短均线周期
    let n2 = C.PARAM(10, "N2"); //长均线周期
    //输出序列
    let m1 = C.OUTS("LINE", "ma" + n1, {color: RED});
    let m2 = C.OUTS("LINE", "ma" + n2, {color: GREEN});
    //计算
    while(true) {
        let i = yield;
        m1[i] = MA(i, C.DS.close, n1, m1);  //计算短均线值
        m2[i] = MA(i, C.DS.close, n2, m2);  //计算长均线值
        if (m1[i] > m2[i] && m1[i-1] <= m2[i-1])  //短均线上穿长均线，买进
            C.ORDER(i, "BUY", "CLOSEOPEN", 1);
        if (m1[i] < m2[i] && m1[i-1] >= m2[i-1])  //短均线下穿长均线，卖出
            C.ORDER(i, "SELL", "CLOSEOPEN", 1);
    }
}
