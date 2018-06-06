function* dmi(C){
    //指标定义
    C.DEFINE({
        type: "SUB",
        cname: "趋向指标",
        state: "KLINE"
    });
    let n = C.PARAM(14, "N", {min:1, max:100});
    let m = C.PARAM(6, "M", {min:1, max:30});
    //输出序列
    let pdi = C.OUTS("LINE", "PDI", {color: YELLOW});
    let mdi = C.OUTS("LINE", "MDI", {color: GREEN});
    let adx = C.OUTS("LINE", "ADX", {color: LIGHTBLUE});
    let adxr = C.OUTS("LINE", "ADXR", {color: LIGHTRED});

    let tr = [];
    let sum_tr = [];
    let dmp = [];
    let sum_dmp = [];
    let dmm =[];
    let sum_dmm = [];
    let ad = [];
    //计算
    while(true) {
        let i = yield;
        let h = C.DS.high[i];
        let l = C.DS.low[i];
        let last_c = C.DS.close[i-1];
        tr[i] = MAX( h-l, Math.abs(last_c-h), Math.abs(last_c-l));
        sum_tr[i] = SUM(i, tr, n, sum_tr);
        let hd = h - C.DS.high[i-1];
        let ld = C.DS.low[i-1] - l;
        dmp[i] = hd>0 && hd>ld ? hd: 0;
        sum_dmp[i] = SUM(i, dmp, n, sum_dmp);
        dmm[i] = ld>0 && ld >hd ? ld : 0;
        sum_dmm[i] = SUM(i, dmm, n, sum_dmm);

        pdi[i] = sum_dmp[i] / sum_tr[i] * 100;
        mdi[i] = sum_dmm[i] / sum_tr[i] * 100;
        ad[i] = Math.abs(mdi[i]-pdi[i]) / (mdi[i]+pdi[i]) * 100;
        adx[i] = MA(i, ad, m, adx);
        adxr[i] = (adx[i] + adx[i-m+1]) / 2;
    }
}
