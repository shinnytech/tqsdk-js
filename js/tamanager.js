function COLOR(r, g, b){
    this.color = r | (g << 8) | (b << 16);
}
COLOR.prototype.toJSON = function() {
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

class MapPool {
    constructor() {
        this.using_pool = [];
        this.free_pool = [];
    }

    allocate() {
        var x = (this.free_pool.length === 0) ? (new Map()) : (this.free_pool.pop());
        x.clear();
        this.using_pool.push(x);
        return x;
    }

    collect() {
        // release pooled objects
        this.free_pool = this.using_pool.slice();
        this.using_pool = [];
    }
}

const cachePool = new MapPool(Map);

function CacheWrapper(orign_func) {
    var cache = cachePool.allocate();
    var f = function (p) {
        if (cache.has(p))
            return cache.get(p);
        var v = orign_func(p);
        cache.set(p, v);
        return v;
    }
    return f;
}

miss_count = 0;

function RecursionWrapper(first_func, next_func) {
    var cache = cachePool.allocate();
    var empty = true;
    var f = function (p) {
        if (cache.has(p))
            return cache.get(p);
        if (p < CALC_CONTEXT.DATA_LEFT) {
            return NaN;
        }
        miss_count++;
        // console.log("miss "+ miss_count +":" + p);
        if (empty) {
            // console.log("cache empty");
            empty = false;
            var v = first_func(p);
            cache.set(p, v);
            return v;
        } else {
            var v = next_func(p);
            cache.set(p, v);
            return v;
        }
    }
    return f;
}

function SUM(serial, n) {
    var f = CacheWrapper(function (p) {
        var s = 0;
        for (var i = p - n + 1; i <= p; i++) {
            s += serial(i);
        }
        return s;
    });
    return f;
}

function _sum(serial, n, p){
    var s = 0;
    for (var i = p - n + 1; i <= p; i++) {
        s += serial(i);
    }
    return s;
}

function SUM(serial, n) {
    var f = RecursionWrapper(
        (p) => _sum(serial, n, p),
        (p) => isNaN(f(p - 1)) ? _sum(serial, n, p) : f(p-1) - serial(p-n) + serial(p),
    );
    return f;
}

// function MA(serial, n) {
//     /*
//     MA
//     MA(X,N) 求X在N个周期内的简单移动平均
//
//     算法：MA(X,5)=(X1+X2+X3+X4+X5)/5
//     注：
//     1、N包含当前k线。
//     2、简单移动平均线沿用最简单的统计学方式，将过去某特定时间内的价格取其平均值。
//     3、当N为有效值，但当前的k线数不足N根，函数返回空值。
//     4、N为0或空值的情况下，函数返回空值。
//     5、N可以为变量
//
//     例1：
//     MA5:=MA(C,5);//求5周期收盘价的简单移动平均。
//     例2：
//     N:=BARSLAST(DATE<>REF(DATE,1))+1;//分钟周期，日内k线根数
//     M:=IFELSE(N>10,10,N);//k线超过10根，M取10，否则M取实际根数
//     MA10:MA(C,M);//在分钟周期上，当天k线不足10根，按照实际根数计算MA10，超过10根按照10周期计算MA10。
//     */
//     var f = CacheWrapper(function (p) {
//         var s = 0;
//         for (var i = p - n + 1; i <= p; i++) {
//             s += serial(i);
//         }
//         return s / n;
//     });
//     return f;
// }

function MA(serial, n) {
    var s = SUM(serial, n)
    return (p) => (s(p) / n);
}

function EMA(serial, n) {
    /*
    EMA
    EMA(X,N)：求N周期X值的指数加权移动平均（平滑移动平均）。

    注：
    1、N包含当前k线。
    2、对距离当前较近的k线赋予了较大的权重。
    3、当N为有效值，但当前的k线数不足N根，按实际根数计算。
    4、N为0或空值时返回值为空值。
    5、N可以为变量

    EMA(X,N)=2*X/(N+1)+(N-1)*REF(EMA(X,N),1)/(N+1)

    例1：
    EMA10:=EMA(C,10);//求收盘价10周期指数加权移动平均值
     */
    var f = RecursionWrapper(
        (i) => serial(i),
        (i) => isNaN(f(i - 1)) ? serial(i) : (2 * serial(i) / (n + 1) + (n - 1) * f(i - 1) / (n + 1)),
    );
    return f;
}

function SMA(serial, n, m) {
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
    var f = RecursionWrapper(
        (i) => serial(i),
        (i) => isNaN(f(i - 1)) ? serial(i) : (f(i - 1) * (n - m) / n + serial(i) * m / n),
    );
    return f;
}

function STD(serial, n) {
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

function HHV(serial, n) {
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
    var f = CacheWrapper(function (p) {
        var s;
        for (var i = p - n + 1; i <= p; i++) {
            var v = serial(i);
            if (s === undefined || v > s)
                s = v;
        }
        return s;
    });
    return f;
}

function LLV(serial, n) {
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
    var f = CacheWrapper(function (p) {
        var s;
        for (var i = p - n + 1; i <= p; i++) {
            var v = serial(i);
            if (s === undefined || v < s)
                s = v;
        }
        return s;
    });
    return f;
}


// ---------------------------------------------------------------------------
function single_demo(C) {
    C.DEFINE({
        type: "MAIN",
        memo: "过程式写法示意",
        cname: "均线 Tick ma",
        state: "TICK",
        yaxis: [
            {id: 0, mid: NaN, format: "AUTO"}
        ]
    });
    var n = C.PARAM(10, "N");
    for (var i = C.CALC_LEFT; i <= C.CALC_RIGHT; i++) {
        var s = 0;
        for (var j = i - n + 1; j <= i; j++) {
            s += C.SERIAL("TLAST")(j);
        }
        s /= n;
        C.OUT(i, s, "ma", {style: "LINE", color: RED, width: 3});
    }
};

function sar(C) {
    // C.DEFINE({
    //     type: "MAIN",
    //     cname: "SAR",
    //     memo: "",
    //     state: "KLINE",
    // });
    // var afStep = C.PARAM(0.02, "afStep", {memo: "加速因子"});
    // var afMin = C.PARAM(0.04, "afMin", {memo: "加速因子最小值"});
    // var afMax = C.PARAM(0.2, "afMax", {memo: "加速因子最大值"});
    // var open = C.SERIAL("OPEN");
    // var close = C.SERIAL("CLOSE");
    // var high = C.SERIAL("HIGH");
    // var low = C.SERIAL("LOW");
    //
    //
    // var sar_func = RecursionWrapper(
    //     /*
    //     计算Tn周期的SAR值为例，计算公式如下：
    //     SAR(Tn)=SAR(Tn-1)+AF(Tn)*[EP(Tn-1)-SAR(Tn-1)]
    //     其中，SAR(Tn)为第Tn周期的SAR值，SAR(Tn-1)为第(Tn-1)周期的值
    //     AF为加速因子(或叫加速系数)，EP为极点价(最高价或最低价)
    //     //1、初始值SAR(T0)的确定
    //     //若T1周期中SAR(T1)上涨趋势，则SAR(T0)为T0周期的最低价，若T1周期下跌趋势，则SAR(T0)为T0周期 的最高价；
    //     4、SAR值的确定
    //     (a)通过公式SAR(Tn)=SAR(Tn-1)+AF(Tn)*[EP(Tn-1)-SAR(Tn-1)]，计算出Tn周期的值；
    //     (b)若Tn周期为上涨趋势，当SAR(Tn)>Tn周期的最低价(或SAR(Tn)>Tn-1周期的最低价)，则Tn周期最终 SAR值应为Tn-1、Tn周期的最低价中的最小值，
    //     当SAR(Tn)<=Tn周期的最低价且SAR(Tn)<=Tn-1周期的最低价，则Tn周期最终SAR值为SAR(Tn)，即 SAR=SAR(Tn)；
    //     (c)若Tn周期为下跌趋势，当SAR(Tn)<Tn周期的最高价(或SAR(Tn)<Tn-1周期的最高价)，则Tn周期最终 SAR值应为Tn-1、Tn周期的最高价中的最大值，
    //     当SAR(Tn)>=Tn周期的最高价且SAR(Tn)>=Tn-1周期的最高价，则Tn周期最终SAR值为SAR(Tn)，即 SAR=SAR(Tn)；
    //     */
    //     (i) => close(i) >= open(i) ? low(i):high(i),
    //     (i) => sar_func(i-1) + af(i) * (ep(i) - sar_func(i-1)),
    // );
    //
    // var af = RecursionWrapper(
    //     /*
    //     (a)加速因子初始值为0.02，即AF(T0)=0.02；
    //     (b)若Tn-1，Tn周期都为上涨趋势时，当Tn周期的最高价>Tn-1周期的最高价,则AF(Tn)=AF(Tn-1)+0.02， 当Tn周期的最高价<=Tn-1周期的最高价,则AF(Tn)=AF(Tn-1)，但加速因子AF最高不超过0.2；
    //     (c)若Tn-1，Tn周期都为下跌趋势时，当Tn周期的最低价<Tn-1周期的最低价,则AF(Tn)=AF(Tn-1)+0.02， 当Tn周期的最低价>=Tn-1周期的最低价,则AF(Tn)=AF(Tn-1)；
    //     (d)任何一次行情的转变，加速因子AF都必须重新由0.02起算；
    //     */
    //     if(i == C.CALC_LEFT)
    //         return 0.02;
    //     if(newHigh > ep){
    //         var v = af(i-1) + acceleration;
    //         if(v > accelerationMax)
    //             v = accelerationMax;
    //         return v;
    //     }
    // }
    // function ep(i){
    //     // 2、极点价EP的确定
    //     // 若Tn周期为上涨趋势，EP(Tn-1)为Tn-1周期的最高价，若Tn周期为下跌趋势，EP(Tn-1)为Tn-1周期的最 低价；
    //     if(i == C.CALC_LEFT){
    //     }
    // }
    // C.OUTS(sar, "sar", {style:"DOT", color: RED});
};

// SAR1
// SAR1(N,STEP,MAX) 返回抛物转向值。
//
// 根据公式SAR1(n)=SAR1(n-1)+AF*(EP(n-1)-SAR1(n-1))计算
//
// 其中：
// SAR1(n-1)：上根K线SAR1的绝对值
//
// AF：加速因子，当AF小于MAX时，
// 上涨行情，H>HV(H,N)   AF = AF+STEP; H<=HV(H,N) AF = AF;
// 下跌行情，L<lV(L,N)   AF = AF+STEP; L>=LV(L,N) AF = AF;
// 涨跌发生转换时，AF重新计算
// EP：一个涨跌内的极值，在上涨行情中为前N根K线的最高价；下跌行情中为前N根K线的最低价




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
            eval(func_name + ' = function(C){' + code + '}');
            var f = window[func_name];
            tm_update_class_define(f);
        }
        // 用户自定义指标
        for (var i = 0; i < CMenu.datas.length; i++) {
            var func_name = CMenu.datas[i].name;
            var code = CMenu.datas[i].draft.code;
            eval(func_name + ' = function(C){' + code + '}');
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
                if (typeof param_default_value == "string"){
                    param_define.type = "STRING";
                }else if (typeof param_default_value == "number"){
                    param_define.type = "NUMBER";
                }else if (param_default_value instanceof COLOR){
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
        ta_func(C);
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

    function get_instance_param_value(instance, param_name) {
        return instance.params[param_name].value;
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

    function recalcInstance(ta_instance) {
        // try {
        var xrange = DM.get_kdata_range(ta_instance.ins_id, ta_instance.dur_nano, ta_instance.instance_id);
        // console.log("recalcInstance" + xrange);
        if (xrange === undefined)
            return;
        var [data_left, data_right] = xrange;
        //准备计算环境
        out_values = {};
        //@todo: 这里目前是对整个序列全部重算，后续需要优化(已经计算过，且原始数据未改变的不用重算；只计算可见窗口附近的数据)
        CALC_CONTEXT.DATA_LEFT = parseInt(data_left);
        CALC_CONTEXT.DATA_RIGHT = parseInt(data_right);
        CALC_CONTEXT.CALC_LEFT = parseInt(data_left);
        CALC_CONTEXT.CALC_RIGHT = parseInt(data_right);
        CALC_CONTEXT.DEFINE = function () {
        };
        CALC_CONTEXT.PARAM = function (param_default_value, param_name) {
            return get_instance_param_value(ta_instance, param_name);
        };
        CALC_CONTEXT.SERIAL = function (serial_selector) {
            var ins_id = ta_instance.ins_id;
            var dur_id = ta_instance.dur_nano;
            var instance_id = ta_instance.instance_id;
            var selector = serial_selector.toLowerCase();
            var ds = DM.get_kdata_obj(ins_id, dur_id, instance_id);
            var f_serial = function (p) {
                if(ds && ds[p]){
                    return ds[p][selector];
                }else{
                    return NaN;
                }
            };
            return f_serial;
        };
        var outSerial = function (serial_name, options) {
            out_values[serial_name] = out_values[serial_name] || {};
            var serial = out_values[serial_name];
            if (serial.style === undefined) {
                serial.values = {};
                serial.style = "LINE";
                serial.width = 1;
                serial.color = RGB(0xFF, 0x00, 0x00);
                serial.yaxis = 0;
                if (options != undefined) {
                    if ('style' in options)
                        serial.style = options["style"];
                    if ('width' in options)
                        serial.width = options["width"];
                    if ('color' in options)
                        serial.color = options["color"];
                    if ('yaxis' in options)
                        serial.yaxis = options["yaxis"];
                    if ('memo' in options)
                        serial.memo = options["memo"];
                }
            }
            return serial;
        };
        CALC_CONTEXT.OUT = function (x, value, serial_name, options) {
            var serial = outSerial(serial_name, options);
            serial.values[x] = [value];
        };
        CALC_CONTEXT.OUTS = function (values, serial_name, options) {
            var serial = outSerial(serial_name, options);
            var calc_left = parseInt(CALC_CONTEXT.CALC_LEFT);
            var calc_right = parseInt(CALC_CONTEXT.CALC_RIGHT);
            if (values.constructor === Array) {
                for (var i = calc_left; i <= calc_right; i++) {
                    serial.values[i] = [];
                    for (var j in values) {
                        value_func = values[j];
                        serial.values[i][j] = value_func(i);
                    }
                }
            } else {
                for (var i = calc_left; i <= calc_right; i++) {
                    serial.values[i] = [values(i)];
                }
            }
        };
        var func = window[ta_instance.ta_class_name];
        func(CALC_CONTEXT);
        //将计算结果发给主进程
        var pack = {
            aid: "set_indicator_data",
            instance_id: ta_instance.instance_id,
            epoch: ta_instance.epoch,
            serials: out_values,
        }
        WS.sendJson(pack);
        cachePool.collect();
    }

    function tm_set_indicator_instance(instance_pack) {
        var instance_id = instance_pack.instance_id;
        instance_pack.func = window[instance_pack.ta_class_name];
        ta_instance_map[instance_id] = instance_pack;

        recalcInstance(instance_pack);

    }

    function tm_recalc_indicator_by_id(instance_id) {
        recalcInstance(ta_instance_map[instance_id]);
    }

    return {
        init: tm_init,
        update_class_define: tm_update_class_define,
        recalc_indicator_by_id: tm_recalc_indicator_by_id,
        set_indicator_instance: tm_set_indicator_instance,
    }
}();

