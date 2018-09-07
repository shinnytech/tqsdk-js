function* test (C) {
    // 定义指标
    C.DEFINE({
        type: "MAIN", // 指标类型, SUB=副图指标, MAIN=主图指标
    });

    while(true) {
        let i = yield;
        C.DRAW_TEXT(i, i,  C.DS.high[i], i+'', color=0xFFFFFF);
        //console.log('i=',i)
console.log("left = " + C.view_left + "    right = " + C.view_right);
    }
}