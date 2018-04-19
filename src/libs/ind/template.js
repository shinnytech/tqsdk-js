function* ${1:function_name} (C) {
    // 定义指标
    C.DEFINE({
        type: "${2:SUB}", // 指标类型, SUB=副图指标, MAIN=主图指标
    });

    //TODO: 定义参数. 如果技术指标需要参数, 请在这里按下面的例子定义:
    //example: let n = C.PARAM(3, "N");

    //TODO: 定义输出序列. 请在这里按下面的例子定义:
    //example: let k = C.OUTS("LINE", "k", {color: RED});

    //TODO: 定义临时序列. 如果技术指标需要临时序列, 请在这里按下面的例子定义:
    //example: let rsv = [];

    while(true) {
        let i = yield;
        //TODO: 在这里填写指标的计算代码

    }
}
