class ma extends Indicator {
    static define() {
        return {
            type: "MAIN",
            cname: "MA+NEW",
            state: "KLINE",
            params: [
                {name: "N1", default: 3},
                {name: "N2", default: 10},
                {name: "N3", default: 30},
                {name: "N4", default: 60},
            ],
        };
    }
    init(){
        this.ma1 = this.OUTS("LINE", "ma1", {color: RED});
        this.ma2 = this.OUTS("LINE", "ma2", {color: YELLOW});
        this.ma3 = this.OUTS("LINE", "ma3", {color: GREEN});
        this.ma4 = this.OUTS("LINE", "ma4", {color: LIGHTBLUE});
    }
    calc(i) {
        this.ma1[i] = MA(i, this.DS.close, this.PARAMS.N1, this.ma1);
        this.ma2[i] = MA(i, this.DS.close, this.PARAMS.N2, this.ma2);
        this.ma3[i] = MA(i, this.DS.close, this.PARAMS.N3, this.ma3);
        this.ma4[i] = MA(i, this.DS.close, this.PARAMS.N4, this.ma4);
    }
}
