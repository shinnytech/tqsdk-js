C.DEFINE({
    type: "SUB",
    state: "KLINE",
});
var open = C.SERIAL("OPEN");
var high = C.SERIAL("HIGH");
var low = C.SERIAL("LOW");
var close = C.SERIAL("CLOSE");
C.OUTS([open, high, low, close], "diff", {style: "KLINE"});
