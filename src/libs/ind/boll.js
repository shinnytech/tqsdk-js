class boll extends Indicator {
    static define() {
        return {
            type: "MAIN",
            cname: "布林带+NEW",
            state: "KLINE",
            params: [
                {name: "N", default: 3},
                {name: "P", default: 5},
            ],
        };
    }
    init(){
        this.top = this.OUTS("LINE", "top", {color: YELLOW});
        this.bottom = this.OUTS("LINE", "bottom", {color: RED});
        this.mid = [];
        this.std = [];
    }
    calc(i) {
        this.mid[i] = MA(i, this.DS.close, this.PARAMS.N, this.mid);
        this.std[i] = STDEV(i, this.DS.close, this.PARAMS.N, this.std);
        this.top[i] = this.mid[i] + this.PARAMS.P * this.std[i];
        this.bottom[i] = this.mid[i] - this.PARAMS.P * this.std[i];
    }
}
