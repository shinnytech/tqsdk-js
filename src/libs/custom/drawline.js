function* drawline (C) {
    // 定义指标
    C.DEFINE({
        type: "MAIN", // 指标类型, SUB=副图指标, MAIN=主图指标
    });

    //TODO: 定义临时序列. 如果技术指标需要临时序列, 请在这里按下面的例子定义:
    let id = 'line1';

    while(true) {
        let i = yield;
        C.DRAW_LINE(id, i-20, C.DS.close[i-100], i, C.DS.high[i]);
    }
}