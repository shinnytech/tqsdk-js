// RSV:=(CLOSE-LLV(LOW,N))/(HHV(HIGH,N)-LLV(LOW,N))*100;//收盘价与N周期最低值做差，N周期最高值与N周期最低值做差，两差之间做比值。
// K:SMA(RSV,M1,1);//RSV的移动平均值
// D:SMA(K,M2,1);//K的移动平均值
// J:3*K-2*D;
// BACKGROUNDSTYLE(1);
C.DEFINE({
    type: "SUB",
    cname: "KDJ",
    memo: "",
    state: "KLINE",
});
var n = C.PARAM(3, "N");
var m1 = C.PARAM(5, "M1");
var m2 = C.PARAM(5, "M2");
var close = C.SERIAL("CLOSE");
var high = C.SERIAL("HIGH");
var low = C.SERIAL("LOW");

var lv = LLV(low, n);
var hv = HHV(high, n);
var rsv = (i) => (hv(i) == lv(i)) ? 0 : (close(i) - lv(i)) / (hv(i) - lv(i)) * 100;
var k = SMA(rsv, m1, 1);
var d = SMA(k, m2, 1);

function j(i) {
    return 3 * k(i) - 2 * d(i);
};
C.OUTS(k, "k", {color: RED});
C.OUTS(d, "d", {color: GREEN});
C.OUTS(j, "j", {color: GREEN});
