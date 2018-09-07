function* drawline (C) {
    // 定义指标
    C.DEFINE({
        type: "MAIN", // 指标类型, SUB=副图指标, MAIN=主图指标
    });

    while(true) {
        
        let i = yield;
        //console.time(i)
         C.DRAW_LINE('line1', i-20, C.DS.close[i-20], i, C.DS.high[i], WHITE, 2, 0);
          C.DRAW_RAY('line2', i-20, C.DS.close[i-20], i, C.DS.high[i], YELLOW, 2, 0);
        C.DRAW_SEG('line3', i-20, C.DS.close[i-20], i, C.DS.high[i],YELLOW, 2, 0);
         C.DRAW_PANEL('box', i-20, C.DS.close[i-20], i, C.DS.high[i], GREEN, 2, 0 )
          C.DRAW_LINE('line1', i-20, C.DS.close[i-20], i, C.DS.high[i], WHITE, 0, 0);
        //console.timeEnd(i)
    }
}