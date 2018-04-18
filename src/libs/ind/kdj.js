class kdj extends Indicator {
    static define() {
        return {
            type: "SUB",
            cname: "KDJ+NEW",
            state: "KLINE",
            params: [
                {name: "N", default:3},
                {name: "M1", default:5},
                {name: "M2", default:5},
            ],
        }
    }
    init(){
        //输入序列
        this.k = this.OUTS("LINE", "k", {color: RED});
        this.d = this.OUTS("LINE", "d", {color: GREEN});
        this.j = this.OUTS("LINE", "j", {color: YELLOW});
        this.rsv = [];
    }
    calc(i) {
        let hv = HIGHEST(i, this.DS.high, this.PARAMS.N);
        let lv = LOWEST(i, this.DS.low, this.PARAMS.N);
        this.rsv[i] = (hv == lv) ? 0 : (this.DS.close[i] - lv) / (hv - lv) * 100;
        this.k[i] = SMA(i, this.rsv, this.PARAMS.M1, 1, this.k);
        this.d[i] = SMA(i, this.k, this.PARAMS.M2, 1, this.d);
        this.j[i] = 3*this.k[i] - 2*this.d[i];
    }
}
