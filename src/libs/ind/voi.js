class voi extends Indicator {
    static define() {
        return {
            type: "SUB",
            cname: "成交量持仓量+NEW",
            state: "KLINE",
            yaxis: [
                {id: 0, format: "HUGE", min: 0},
                {id: 1, format: "HUGE"},
            ]
        };
    }
    init(){
        this.vol = this.OUTS("PCBAR", "vol", {yaxis: 0});
        this.oi = this.OUTS("LINE", "oi", {color: YELLOW, yaxis: 1});
    }
    calc(i) {
        this.vol[i] = this.DS.volume[i];
        this.oi[i] = this.DS.close_oi[i];
    }
}
