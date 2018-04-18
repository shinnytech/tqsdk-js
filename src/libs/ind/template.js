class ${1:indicator_name} extends Indicator {
    static define() {
        return {
            type: "${2:SUB}", // 指标类型, SUB=副图指标, MAIN=主图指标
            cname: "",
            state: "KLINE",
            params: [

            ],
            yaxis: [

            ]
        };
    }
    init(){
        //TODO: 定义输出序列. 请在这里按下面的例子定义:
        // this.oi = this.OUTS("LINE", "oi", {color: YELLOW});
    }
    calc(i) {
        // TODO: 在这里填写指标的计算代码
        // this.vol[i] = this.DS.volume[i];
        // this.oi[i] = this.DS.close_oi[i];
    }
}

