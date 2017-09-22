function _sum(serial, n, p) {
    var s = 0;
    for (var i = p - n + 1; i <= p; i++) {
        s += serial[i];
    }
    return s;
}

function SUM(i, serial, n, cache) {
    if (cache.length == 0 || isNaN(cache[i - 1]))
        return _sum(serial, n, i);
    return cache[i - 1] - serial[i - n] + serial[i];
}

function MA(i, serial, n, cache) {
    /*
        MA
        MA(X,N) 求X在N个周期内的简单移动平均

        算法：MA(X,5)=(X1+X2+X3+X4+X5)/5
        注：
        1、N包含当前k线。
        2、简单移动平均线沿用最简单的统计学方式，将过去某特定时间内的价格取其平均值。
        3、当N为有效值，但当前的k线数不足N根，函数返回空值。
        4、N为0或空值的情况下，函数返回空值。
        5、N可以为变量

        例1：
        MA5:=MA(C,5);//求5周期收盘价的简单移动平均。
        例2：
        N:=BARSLAST(DATE<>REF(DATE,1))+1;//分钟周期，日内k线根数
        M:=IFELSE(N>10,10,N);//k线超过10根，M取10，否则M取实际根数
        MA10:MA(C,M);//在分钟周期上，当天k线不足10根，按照实际根数计算MA10，超过10根按照10周期计算MA10。
        */
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
        for (var k = i - n + 1; k <= i; k++) {
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

var TM = function () {
    function tm_init(content) {
        //更新所有指标类定义, 并发送到主进程
        for (var func_name in content) {
            if (G_Error_Class_Name.indexOf(func_name) > -1) {
                continue;
            }
            tm_init_one(content[func_name]);
        }
    }

    function tm_init_one(indicator) {
        console.log(indicator)
        var func_name = indicator.name;
        var code = indicator.draft.code;
        try {
            if (indicator.type !== 'custom_wh') {
                eval(func_name + ' = ' + code);
                tm_update_class_define(self[func_name]);
            } else {
                var req = covertWHRequest(indicator);
                fetch('http://192.168.1.80:8000/convert/wh', {
                    method: 'POST',
                    body: JSON.stringify(req)
                })
                    .then(response => response.json())
                    .then(data => {
                        eval(func_name + ' = ' + data.target);
                        tm_update_class_define(self[func_name]);
                    });
            }
        } catch (e) {
            console.log(e)
            postMessage({
                cmd: 'feedback', content: {
                    error: true,
                    type: 'define',
                    message: e.message,
                    func_name: func_name
                }
            });
            return;
        }
        postMessage({
            cmd: 'feedback', content: {
                error: false,
                type: 'define',
                message: 'success',
                func_name: func_name
            }
        });
    }

    function covertWHRequest(indicator) {
        let type = 'MAIN';
        switch (indicator.prop) {
            case "主图K线形态":
                type = 'MAIN';
                break;
            case "副图指标":
                type = 'SUB';
                break;
            case "K线附属指标":
                type = 'MAIN';
                Notify.error('未实现 K线附属指标');
                return;
                break;
        }
        let params = [];
        for (let i = 1; i <= 6; i++) {
            let p = indicator.params[i];
            if (p && p.name)
                params.push([p.name, Number(p.min), Number(p.max), Number(p.default_value)]);
        }
        return {
            id: indicator.name, //指标函数名
            cname: indicator.name, //指标中文名称
            type: type, //指标类型, MAIN=主图指标, SUB=副图指标
            params: params,
            src: indicator.draft.code //文华原代码
        }
    }

    function tm_update_class_define(ta_func) {
        var indicator_name = ta_func.name;
        //调用指标函数，提取指标信息
        var params = new Map();
        var input_serials = new Map();
        var output_serials = new Map();
        //在global环境中准备全部的系统函数
        var ta_class_define = {
            "name": indicator_name,
            "cname": indicator_name,
            "type": "SUB",
            "state": "KLINE",
            "yaxis": [{id: 0}],
            "params": [],
        };
        var C = {};
        C.DEFINE = function (options) {
            if (!(options === undefined)) {
                Object.assign(ta_class_define, options);
            }
        };
        C.PARAM = function (param_default_value, param_name, options) {
            var param_define = params.get(param_name);
            if (param_define === undefined) {
                param_define = {
                    name: param_name,
                    default: param_default_value,
                };
                if (typeof param_default_value === "string") {
                    param_define.type = "STRING";
                } else if (typeof param_default_value === "number") {
                    param_define.type = "NUMBER";
                } else if (param_default_value instanceof COLOR) {
                    param_define.type = "COLOR";
                }
                if (options !== undefined) {
                    param_define.memo = options.MEMO;
                    param_define.min = options.MIN;
                    param_define.max = options.MAX;
                    param_define.step = options.STEP;
                }
                params.set(param_name, param_define);
            }
            return param_default_value;
        };
        C.SERIAL = () => {
        };
        C.OUT = () => {
        };
        C.OUTS = function (style, serial_name, options) {
            if (style === "KLINE")
                return [null, null, null, null];
            else
                return null;
        };
        C.CALC_LEFT = 0;
        C.CALC_RIGHT = 0;
        var f = ta_func(C);
        f.next();

        //指标信息格式整理
        params.forEach(function (value, key) {
            ta_class_define["params"].push(value)
        });
        ta_class_define.aid = "register_indicator_class";
        //发送指标类信息到主进程
        WS.sendJson(ta_class_define);
    }

    return {
        sendIndicatorClassList: tm_init,
        sendIndicatorClass: tm_init_one
    };
}();
