class kdj extends Indicator
{
    static define() {
        return {
            func: kdj,
            type: "SUB",
            cname: "KDJ",
            state: "KLINE",
            params: [
                (3, "N"),
                (5, "M1"),
                (5, "M2"),
            ],
        }
    }
    constructor(params){
        this.params = params;
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
        this.j[i] = 3*k[i] -2*d[i];
    }
}


TQ.DEFINE_INDICATOR_CLASS(kdj){
    this.websocket.send(kdj.define());
}
TQ.UNDEFINE_INDICATOR_CLASS();
TQ.NEW_INDICATOR_INSTANCE(kdj, param_values){
    ind = new kdj(param_values);
    this.ta_manager.insert(ind);
    return ind;
}
TQ.UPDATE_INDICATOR_INSTANCE(...);
TQ.DELETE_INDICATOR_INSTANCE();



function* kdj(C){
    //指标定义
    C.DEFINE({
    });
    //输出序列
    //临时序列
    //计算
    while(true) {
        let i = yield;
        let hv = HIGHEST(i, high, n);
        let lv = LOWEST(i, low, n);
        rsv[i] = (hv == lv) ? 0 : (close[i] - lv) / (hv - lv) * 100;
        k[i] = SMA(i, rsv, m1, 1, k);
        d[i] = SMA(i, k, m2, 1, d);
        j[i] = 3*k[i] -2*d[i];
    }
}

const square = new Rectangle(10, 10);


function f(x){
    g.k = 0;
    return g;
}

console.log(f(1));
a = f;
this = a;
a.k = 5;
console.log(a());
console.log(a());
console.log(a());
console.log(a());
// a(1) ===> 2;
//
// print(a.k) ===>5;
//
//
//

// function c(x) {
//     this.k = 5;
// }
//
// var b = new c(x);