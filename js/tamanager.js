function COLOR(r, g, b) {
    this.color = r | (g << 8) | (b << 16);
}

COLOR.prototype.toJSON = function () {
    return this.color;
};

function RGB(r, g, b) {
    return new COLOR(r, g, b);
}

function VALUESERIAL(){
    this.LEFT = 0;
    this.RIGHT = 0;
}
VALUESERIAL.prototype.toJSON = function () {
    var n = new Array();
    for(var i=this.LEFT; i<=this.RIGHT; i++){
        n[i-this.LEFT] = this[i];
    }
    return n;
};
VALUESERIAL.prototype.setRange = function (left, right) {
    this.LEFT = left;
    this.RIGHT = right;
};

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

function MA(i, serial, n, cache){
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
    if (cache.length == 0 || isNaN(cache[i-1]))
        return _sum(serial, n, i) / n;
    return cache[i - 1] - serial[i-n] / n + serial[i] / n;
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
    let s = cache.s ? cache.s : [];
    let x2 = 0;
    let x = 0;
    if (s.length == 0 || !(i-1 in s)){
        for (var k = i - n + 1; k <= i; k++) {
            let d = serial[k];
            x2 += d * d;
            x += d;
        }
    }else{
        x = s[i-1] - serial[i-n] + serial[i];
        x2 = s[i-1] - serial[i-n] * serial[i-n] + serial[i] * serial[i];
    }
    let std = Math.sqrt((x2 - x*x / n) / n);
    if(!isNaN(std)){
        s[i] = [x, x2];
    }
    return std;
}


// ---------------------------------------------------------------------------
//
// function* ma(C){
//     C.DEFINE({
//         type: "MAIN",
//         cname: "6个均线",
//         memo: "一次性加入6根均线",
//         state: "KLINE",
//     });
//     let n1 = C.PARAM(3, "N1");
//     let n2 = C.PARAM(5, "N2");
//     let n3 = C.PARAM(10, "N3");
//     let n4 = C.PARAM(20, "N4");
//     let n5 = C.PARAM(50, "N5");
//     let n6 = C.PARAM(100, "N6");
//     let s = C.SERIAL("CLOSE");
//
//     let s1 = C.OUTS("LINE", "ma" + n1, {color: RED});
//     let s2 = C.OUTS("LINE", "ma" + n2, {color: GREEN});
//     let s3 = C.OUTS("LINE", "ma" + n3, {color: BLUE});
//     let s4 = C.OUTS("LINE", "ma" + n4, {color: RED});
//     let s5 = C.OUTS("LINE", "ma" + n5, {color: GREEN});
//     let s6 = C.OUTS("LINE", "ma" + n6, {color: BLUE});
//     while(true) {
//         let i = yield;
//         s1[i] = MA(i, s, n1, s1);
//         s2[i] = MA(i, s, n2, s2);
//         s3[i] = MA(i, s, n3, s3);
//         s4[i] = MA(i, s, n4, s4);
//         s5[i] = MA(i, s, n5, s5);
//         s6[i] = MA(i, s, n6, s6);
//     }
// }

// ---------------------------------------------------------------------------

var ta_instance_map = {};
var ta_class_map = {};

var TM = function () {
    function tm_init() {
        //更新所有指标类定义, 并发送到主进程
        // 系统指标
        for (var i = 0; i < CMenu.sys_datas.length; i++) {
            var func_name = CMenu.sys_datas[i].name;
            var code = CMenu.sys_datas[i].draft.code;
            eval(func_name + ' = ' + code);
            var f = window[func_name];
            tm_update_class_define(f);
        }
        // 用户自定义指标
        for (var i = 0; i < CMenu.datas.length; i++) {
            var func_name = CMenu.datas[i].name;
            var code = CMenu.datas[i].draft.code;
            eval(func_name + ' = ' + code);
            var f = window[func_name];
            tm_update_class_define(f);
        }
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
        C.OUTS = function (style, serial_name, options) {
            if(style=="KLINE")
                return [null, null, null, null];
            else
                return null;
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
        for (var serial_name in instance.out_datas) {
            var serial_from = instance.out_datas[serial_name];
            for(var j in serial_from){
                serial_from[j].setRange(calc_left, calc_right);
            }
        }
        //将计算结果发给主进程
        var pack = {
            aid: "set_indicator_data",
            instance_id: instance.instance_id,
            epoch: instance.epoch,
            range_left: calc_left,
            range_right: calc_right,
            serials: instance.out_series,
            datas: instance.out_datas,
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
        instance.out_series = {};
        instance.out_datas = {};
        instance.OUTS = function (style, serial_name, options) {
            instance.out_series[serial_name] = {};
            var serial = instance.out_series[serial_name];
            serial.style = style;
            serial.width = 1;
            serial.color = RGB(0xFF, 0x00, 0x00);
            serial.yaxis = 0;
            if (options) {
                serial.width = options["width"] ? options["width"] : serial.width;
                serial.color = options["color"] ? options["color"] : serial.color;
                serial.yaxis = options["yaxis"] ? options["yaxis"] : serial.yaxis;
                serial.memo = options["memo"] ? options["memo"] : serial.memo;
            }
            if(style == "KLINE"){
                var s = [new VALUESERIAL(), new VALUESERIAL(), new VALUESERIAL(), new VALUESERIAL()];
                instance.out_datas[serial_name] = s;
                return s;
            }else{
                var s = new VALUESERIAL();
                instance.out_datas[serial_name] = [s];
                return s;
            }
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

