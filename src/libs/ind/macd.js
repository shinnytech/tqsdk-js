class macd extends Indicator
{
    static define() {
        return {
            type: "SUB",
            cname: "MACD+NEW",
            state: "KLINE",
            yaxis: [
                {id: 0, mid: 0, format: "NUMBER2"},
            ],
            params: [
                {name: "SHORT", default: 20, min: 1, memo:"短周期"},
                {name: "LONG", default: 35, min: 2, memo:"长周期"},
                {name: "M", default: 10, min: 1},
            ],
        };
    }
    init(){
        this.diff = this.OUTS("LINE", "diff", {color: WHITE, width: 3});
        this.dea = this.OUTS("LINE", "dea", {color: YELLOW, width: 1});
        this.bar = this.OUTS("RGBAR", "bar");
        this.eshort = [];
        this.elong = [];
    }
    calc(i) {
        this.eshort[i] = EMA(i, this.DS.close, this.PARAMS.SHORT, this.eshort);
        this.elong[i] = EMA(i, this.DS.close, this.PARAMS.LONG, this.elong);
        this.diff[i] = this.eshort[i] - this.elong[i];
        this.dea[i] = EMA(i, this.diff, this.PARAMS.M, this.dea);
        this.bar[i] = 2 * (this.diff[i] - this.dea[i]);
    }
}
