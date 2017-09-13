function COLOR(r, g, b) {
    this.color = r | (g << 8) | (b << 16);
}

COLOR.prototype.toJSON = function () {
    return this.color;
};

function RGB(r, g, b) {
    return new COLOR(r, g, b);
}

const RED = RGB(0xFF, 0, 0);
const GREEN = RGB(0, 0xFF, 0);
const BLUE = RGB(0, 0, 0xFF);
const CYAN = RGB(0, 0xFF, 0xFF);
const BLACK = RGB(0, 0, 0);
const WHITE = RGB(0xFF, 0xFF, 0xFF);
const GRAY = RGB(0x80, 0x80, 0x80);
const MAGENTA = RGB(0xFF, 0, 0xFF);
const YELLOW = RGB(0xFF, 0xFF, 0);
const LIGHTGRAY = RGB(0xD3, 0xD3, 0xD3);
const LIGHTRED = RGB(0xF0, 0x80, 0x80);
const LIGHTGREEN = RGB(0x90, 0xEE, 0x90);
const LIGHTBLUE = RGB(0x8C, 0xCE, 0xFA);


CALC_CONTEXT = {
    CALC_LEFT: NaN,
    CALC_RIGHT: NaN,
    DATA_LEFT: NaN,
    DATA_RIGHT: NaN,
};

function _sum(serial, n, p) {
    var s = 0;
    for (var i = p - n + 1; i <= p; i++) {
        s += serial[i];
    }
    return s;
}

function SUM(i, serial, n, cache) {
    if (cache.length == 0 || isNaN(cache[i-1]))
        return _sum(serial, n, i);
    return cache[i - 1] - serial[i-n] + serial[i];
}

function MA(serial, n) {
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
    var s = SUM(serial, n)
    return (p) => (s(p) / n);
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
    return isNaN(cache[i - 1]) ? serial[i] : (cache[i-1] * (n-m) / n + serial[i] * m / n);
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
    var avg = MA(serial, n);
    var v = (i) => {var d = serial(i) - avg(i); return d*d;};
    var sv = SUM(v, n);
    var std = (i) => Math.sqrt(sv(i) / n);
    return std;
}


// ---------------------------------------------------------------------------
function* macd(C) {
    // DIFF : EMA(CLOSE,SHORT) - EMA(CLOSE,LONG);//短周期与长周期的收盘价的指数平滑移动平均值做差。
    // DEA  : EMA(DIFF,M);//DIFF的M个周期指数平滑移动平均
    // 2*(DIFF-DEA),COLORSTICK;//DIFF减DEA的2倍画柱状线
    C.DEFINE({
        type: "SUB",
        cname: "MACD",
        state: "KLINE",
        yaxis: [
            {id: 0, mid: 0}
        ]
    });
    //参数
    var vshort = C.PARAM(20, "SHORT", {MIN: 5, STEP: 5});
    var vlong = C.PARAM(35, "LONG", {MIN: 5, STEP: 5});
    var vm = C.PARAM(10, "M", {MIN: 5, STEP: 5});
    //输入
    var sclose = C.SERIAL("CLOSE");
    //输出
    var diff = C.OUTS("diff", {color: RED});
    var dea = C.OUTS("dea", {color: BLUE, width: 2});
    var bar = C.OUTS("bar", {style: "BAR", color: RED});
    //临时序列
    var eshort = new Array();
    var elong = new Array();
    //计算
    while(true) {
        var i = yield;
        eshort[i] = EMA(i, sclose, vshort, eshort);
        elong[i] = EMA(i, sclose, vlong, eshort);
        diff[i] = eshort[i] - elong[i];
        dea[i] = EMA(i, diff, vm, dea);
        bar[i] = 2 * (diff[i] - dea[i]);
    }
}

// ---------------------------------------------------------------------------

var ta_instance_map = {};
var ta_class_map = {};

var TM = function () {
    function tm_init() {
        // //更新所有指标类定义, 并发送到主进程
        // // 系统指标
        // for (var i = 0; i < CMenu.sys_datas.length; i++) {
        //     var func_name = CMenu.sys_datas[i].name;
        //     var code = CMenu.sys_datas[i].draft.code;
        //     eval(func_name + ' = function(C){' + code + '}');
        //     var f = window[func_name];
        //     tm_update_class_define(f);
        // }
        // // 用户自定义指标
        // for (var i = 0; i < CMenu.datas.length; i++) {
        //     var func_name = CMenu.datas[i].name;
        //     var code = CMenu.datas[i].draft.code;
        //     eval(func_name + ' = function(C){' + code + '}');
        //     var f = window[func_name];
        //     tm_update_class_define(f);
        // }
        tm_update_class_define(macd);
    }

    function tm_update_class_define(ta_func) {
        var indicator_name = ta_func.name;
        //调用指标函数，提取指标信息
        var params = new Map();
        var input_serials = new Map();
        var output_serials = new Map();
        //在global环境中准备全部的系统函数
        ta_class_define = {
            "name": indicator_name,
            "cname": indicator_name,
            "type": "SUB",
            "state": "KLINE",
            "yaxis": [{id: 0}],
            "params": [],
        };
        C = {};
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
                if (typeof param_default_value == "string") {
                    param_define.type = "STRING";
                } else if (typeof param_default_value == "number") {
                    param_define.type = "NUMBER";
                } else if (param_default_value instanceof COLOR) {
                    param_define.type = "COLOR";
                }
                if (!(options === undefined)) {
                    param_define.memo = options.MEMO;
                    param_define.min = options.MIN;
                    param_define.max = options.MAX;
                    param_define.step = options.STEP;
                }
                params.set(param_name, param_define);
            }
            return param_default_value;
        };
        C.SERIAL = function () {
        };
        C.OUT = function () {
        };
        C.OUTS = function () {
        };
        C.CALC_LEFT = 0;
        C.CALC_RIGHT = 0;
        f = ta_func(C);
        f.next();
        //指标信息格式整理
        params.forEach(function (value, key) {
            ta_class_define["params"].push(value)
        });
        ta_class_map[indicator_name] = ta_class_define;
        ta_class_define.aid = "register_indicator_class";
        //发送指标类信息到主进程
        console.log("ta_class_define" + JSON.stringify(ta_class_define));
        WS.sendJson(ta_class_define);
    }

    function get_input_serial_func(instance, serial_selector) {
        return function (P) {
            //@todo: 现在serial_selector只支持简单格式
            if (serial_selector == "TLAST") {
                return DM.get_tdata(instance.ins_id, P, serial_selector, instance.instance_id);
            } else {
                return DM.get_kdata(instance.ins_id, instance.dur_nano, P, serial_selector, instance.instance_id);
            }
        }
    }
    function jsonStringify(obj){
        return JSON.stringify(obj);
    }
    function recalcInstance(instance, calc_left, calc_right) {
        // console.log("recalcInstance:" + ta_instance.ins_id + "," + calc_left + "," + calc_right);
        //执行计算
        var func = instance.func;
        for (var i = calc_left; i <= calc_right; i++) {
            func.next(i);
        }
        //整理计算结果
        result = {}
        for (var serial_name in instance.out_values) {
            var serial_to = {};
            result[serial_name] = serial_to;
            var serial_from = instance.out_values[serial_name];
            serial_to.style = serial_from.style;
            serial_to.width = serial_from.width;
            serial_to.color = serial_from.color;
            serial_to.yaxis = serial_from.yaxis;
            var values_to = {};
            serial_to.values = values_to;
            var values_from = serial_from.values;
            for (var i = calc_left; i <= calc_right; i++) {
                values_to[i] = [values_from[i]];
            }
        }
        //将计算结果发给主进程
        var pack = {
            aid: "set_indicator_data",
            instance_id: instance.instance_id,
            epoch: instance.epoch,
            serials: result,
        };
        var pack_str = jsonStringify(pack);
        WS.sendString(pack_str);
    }

    function tm_set_indicator_instance(instance_pack) {
        var instance_id = instance_pack.instance_id;
        instance_pack.BEGIN = undefined;
        ta_instance_map[instance_id] = instance_pack;
        tm_recalc_indicator_by_id(instance_id);
    }

    function tm_update_instance(instance, begin){
        //准备计算环境
        instance.BEGIN = begin;
        instance.DEFINE = function () {
        };
        instance.PARAM = function (param_default_value, param_name) {
            return instance.params[param_name].value;
        };
        instance.SERIAL = function (serial_selector) {
            var ins_id = instance.ins_id;
            var dur_id = instance.dur_nano;
            var instance_id = instance.instance_id;
            var selector = serial_selector.toLowerCase();
            var ds = DM.get_kdata_obj(ins_id, dur_id, instance_id);
            var f_serial = new Proxy({}, {
                get: function (target, key, receiver) {
                    if (ds && ds[key]) {
                        return ds[key][selector];
                    } else {
                        return NaN;
                    }
                }
            });
            return f_serial;
        };
        instance.out_values = {};
        instance.OUTS = function (serial_name, options) {
            instance.out_values[serial_name] = instance.out_values[serial_name] || {};
            var serial = instance.out_values[serial_name];
            if (serial.style === undefined) {
                serial.values = {};
                serial.style = "LINE";
                serial.width = 1;
                serial.color = RGB(0xFF, 0x00, 0x00);
                serial.yaxis = 0;
                if (options) {
                    serial.style = options["style"] ? options["style"] : serial.style;
                    serial.width = options["width"] ? options["width"] : serial.width;
                    serial.color = options["color"] ? options["color"] : serial.color;
                    serial.yaxis = options["yaxis"] ? options["yaxis"] : serial.yaxis;
                    serial.memo = options["memo"] ? options["memo"] : serial.memo;
                }
            }
            return serial.values;
        };
        //重生成函数
        var f = window[instance.ta_class_name];
        instance.func = f(instance);
    }

    function tm_recalc_indicator_by_id(instance_id) {
        var instance = ta_instance_map[instance_id];
        var xrange = DM.get_kdata_range(instance.ins_id, instance.dur_nano, instance.instance_id);
        if (xrange === undefined)
            return;
        var [calc_left, calc_right] = xrange;
        if (instance.BEGIN === undefined || instance.BEGIN > calc_left){
            tm_update_instance(instance, calc_left);
        }
        recalcInstance(instance, calc_left, calc_right);
    }

    return {
        init: tm_init,
        update_class_define: tm_update_class_define,
        recalc_indicator_by_id: tm_recalc_indicator_by_id,
        set_indicator_instance: tm_set_indicator_instance,
    }
}();

