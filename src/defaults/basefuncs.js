function _sum(serial, n, p) {
    var s = 0;
    for (var i = p - n + 1; i <= p; i++) {
        s += serial[i];
    }
    return s;
}

function SUM(i, serial, n, cache) {
    if (cache === undefined || cache.length == 0 || isNaN(cache[i - 1]))
        return _sum(serial, n, i);
    return cache[i - 1] - serial[i - n] + serial[i];
}

function REF(i, serial, n) {
    return serial[i-n];
}

function IFELSE(c, a, b) {
    return c?a:b;
}

function MA(i, serial, n, cache) {
    if (cache.length == 0 || isNaN(cache[i - 1]))
        return _sum(serial, n, i) / n;
    return cache[i - 1] - serial[i - n] / n + serial[i] / n;
}

function EMA(i, serial, n, cache) {
    if (cache.length == 0)
        return serial[i];
    return isNaN(cache[i - 1]) ? serial[i] : (2 * serial[i] / (n + 1) + (n - 1) * cache[i - 1] / (n + 1));
}

function SMA(i, serial, n, m, cache) {
    /*
    SMA
    SMA(X,N,M) 求X的N个周期内的扩展指数加权移动平均。M为权重。

    计算公式：SMA(X,N,M)=REF(SMA(X,N,M),1)*(N-M)/N+X(N)*M/N
    注：
    1、当N为有效值，但当前的k线数不足N根，按实际根数计算。
    2、 N为0或空值的情况下，函数返回空值。

    例1：
    SMA10:=SMA(C,10,3);//求的10周期收盘价的扩展指数加权移动平均。权重为3。
     */
    if (cache.length == 0)
        return serial[i];
    return isNaN(cache[i - 1]) ? serial[i] : (cache[i - 1] * (n - m) / n + serial[i] * m / n);
}

function HIGHEST(p, serial, n) {
    /*
    HHV
    HHV(X,N)：求X在N个周期内的最高值。

    注：
    1、N包含当前k线。
    2、若N为0则从第一个有效值开始算起;
    3、当N为有效值，但当前的k线数不足N根，按照实际的根数计算;
    4、N为空值时，返回空值。
    5、N可以是变量。

    例1：
    HH:HHV(H,4);//求4个周期最高价的最大值，即4周期高点（包含当前k线）。
    例2：
    N:=BARSLAST(DATE<>REF(DATE,1))+1;//分钟周期，日内k线根数
    HH1:=HHV(H,N);//在分钟周期上，日内高点
     */
    var s;
    for (var i = p - n + 1; i <= p; i++) {
        var v = serial[i];
        if (s === undefined || v > s)
            s = v;
    }
    return s;
}

function LOWEST(p, serial, n) {
    /*
    LLV
    LLV(X,N)： 求X在N个周期内的最小值。

    注：
    1、N包含当前k线。
    2、若N为0则从第一个有效值开始算起;
    3、当N为有效值，但当前的k线数不足N根，按照实际的根数计算;
    4、N为空值时，返回空值。
    5、N可以是变量。

    例1：
    LL:LLV(L,5);//求5根k线最低点（包含当前k线）。
    例2：
    N:=BARSLAST(DATE<>REF(DATE,1))+1;//分钟周期，日内k线根数
    LL1:=LLV(L,N);//在分钟周期上，求当天第一根k线到当前周期内所有k线最低价的最小值。
     */
    var s;
    for (var i = p - n + 1; i <= p; i++) {
        var v = serial[i];
        if (s === undefined || v < s)
            s = v;
    }
    return s;
}

function STD(i, serial, n, cache) {
    /*
    STD
    STD(X,N)：求X在N个周期内的样本标准差。

    注：
    1、N包含当前k线。
    2、N为有效值，但当前的k线数不足N根，该函数返回空值；
    3、N为0时，该函数返回空值；
    4、N为空值，该函数返回空值。
    5、N可以为变量

    算法举例：计算STD(C,3);在最近一根K线上的值。

    用麦语言函数可以表示如下：
    SQRT((SQUARE(C-MA(C,3))+SQUARE(REF(C,1)-MA(C,3))+SQUARE(REF(C,2)-MA(C,3)))/2);

    例：
    STD(C,10)求收盘价在10个周期内的样本标准差。
    //标准差表示总体各单位标准值与其平均数离差平方的算术平均数的平方根，它反映一个数据集的离散程度。STD(C,10)表示收盘价与收盘价的10周期均线之差的平方和的平均数的算术平方根。样本标准差是样本方差的平方根。
     */
    let s = cache.s ? cache.s : [];
    let x2 = 0;
    let x = 0;
    if (s.length == 0 || !(i - 1 in s)) {
        for (let k = i - n + 1; k <= i; k++) {
            let d = serial[k];
            x2 += d * d;
            x += d;
        }
    } else {
        x = s[i - 1] - serial[i - n] + serial[i];
        x2 = s[i - 1] - serial[i - n] * serial[i - n] + serial[i] * serial[i];
    }
    let std = Math.sqrt((x2 - x * x / n) / n);
    if (!isNaN(std)) {
        s[i] = [x, x2];
    }
    return std;
}
