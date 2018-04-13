class kdj extends Indicator
{
    static define() {
        return {
            type: "SUB",
            cname: "KDJ",
            state: "KLINE",
            params: [
                {name: "N", default:3},
                {name: "M1", default:5},
                {name: "M2", default:5},
            ],
        }
    }
    constructor(){
        super();
        //输入序列
        this.close = TQ.GET_KLINE().close;
        this.high = TQ.GET_KLINE().high;
        this.low = TQ.GET_KLINE().low;

        this.k = this.OUTS("LINE", "k", {color: RED});
        this.d = this.OUTS("LINE", "d", {color: GREEN});
        this.j = this.OUTS("LINE", "j", {color: YELLOW});
        this.rsv = [];
    }
    calc(i) {
        let hv = HIGHEST(i, this.high, this.params.n);
        let lv = LOWEST(i, this.low, this.params.n);
        rsv[i] = (hv == lv) ? 0 : (close[i] - lv) / (hv - lv) * 100;
        this.k[i] = SMA(i, rsv, m1, 1, k);
        this.d[i] = SMA(i, k, m2, 1, d);
        this.j[i] = 3*k[i] - 2*d[i];
    }
}

TQ.REGISTER_INDICATOR_CLASS(kdj);
