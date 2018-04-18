class mat extends Indicator {
    static define() {
        return {
            type: "MAIN",
            cname: "均线交易策略演示+NEW",
            state: "KLINE",
            params: [
                {name: "N1", default: 3},
                {name: "N2", default: 10},
            ],
        };
    }
    init(){
        this.m1 = this.OUTS("LINE", "m1", {color: YELLOW});
        this.m2 = this.OUTS("LINE", "m2", {color: RED});
    }
    calc(i) {
        this.m1[i] = MA(i, this.DS.close, this.PARAMS.N1, this.m1);
        this.m2[i] = MA(i, this.DS.close, this.PARAMS.N2, this.m2);
        if (this.m1[i] > this.m2[i] && this.m1[i-1] <= this.m2[i-1])  //短均线上穿长均线，买进
            this.ORDER(i, "BUY", "CLOSEOPEN", 1);
        if (this.m1[i] < this.m2[i] && this.m1[i-1] >= this.m2[i-1])  //短均线下穿长均线，卖出
            this.ORDER(i, "SELL", "CLOSEOPEN", 1);
    }
}
