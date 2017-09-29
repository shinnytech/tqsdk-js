function* ${1:function_name} (C) {
    // 定义指标
    C.DEFINE({
        type: "${2:SUB}", // 类型 SUB MAIN
        cname: "${3:显示中文名称}",
        memo: "${4:备注}",
        state: "${5:KLINE}",
    });

    // 定义参数
    let n = C.PARAM(3, "N");

    // 定义序列 CLOSE OPEN HIGH LOW
    let open = C.SERIAL("OPEN");
    let high = C.SERIAL("HIGH");
    let low = C.SERIAL("LOW");
    let close = C.SERIAL("CLOSE");

    // 输出序列
    let k = C.OUTS("LINE", "k", {color: RED});
    let d = C.OUTS("LINE", "d", {color: GREEN});
    let j = C.OUTS("LINE", "j", {color: YELLOW});

    // 缓存变量
    let rsv = [];

    while(true) {
        let i = yield;
        // 计算指标
    }
}
