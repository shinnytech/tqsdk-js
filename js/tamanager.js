//所有位置都使用同一个AUTO定义
const DEFAULT = 0xFFFFFFFF;

//绘图类型
const LINE = 0x00000001;
const DOT = 0x00000002;
const HISTRO = 0x00000003;
const DOT_LINE = 0x00000004;
const BAR = 0x00000005;
const KLINE = 0x00000006;

//颜色定义
function RGB(r, g, b) {
    return r | (g << 8) | (b << 16);
}

const RED = RGB(0xFF, 0, 0);
const GREEN = RGB(0, 0xFF, 0);
const BLUE = RGB(0, 0, 0xFF);

//指标类型定义
const IKLINE = 0x00000001;
const ITICK = 0x00000002;
const IMAIN = 0x10000000; //必须使用主图
const ISUB = 0x20000000; //必须使用主图

const RANGE_MINMAX = 0x00100000; //Y轴应该按关联数据的最小最大值确定范围
const RANGE_ZEROMAX = 0x00200000; //Y轴应该按关联数据的0 - 最大值确定范围
const RANGE_SYMMETRY = 0x00400000; //Y轴应该以特定值为中轴对称(中值需要指定)
const RANGE_ZERO_SYMMETRY = 0x00800000; //Y轴应该以0为中轴对称

const DT_PRICE = 0x00000001;	//Y轴表示的是价格，小数位数由图表主合约决定
const DT_FLOAT1 = 0x00000008;	//Y轴表示的是1位小数的float

const YAXIS_DEFAULT = IMAIN | DT_FLOAT1 | RANGE_MINMAX;

function MA(serial, n) {
    var f = function (p) {
        var s = 0;
        for (var i = p - n + 1; i <= p; i++) {
            s += serial(i);
        }
        return s / n;
    }
    f.valueOf = function () {
        return this(P);
    }
    return f;
}

EMA = MA;

function SUB(fa, fb) {
    var f = (p) => fa(p) - fb(p);
    f.valueOf = function () {
        return this(P);
    }
    return f;
}

// ---------------------------------------------------------------------------
function ma() {
    DEFINE({TYPE: IKLINE, YAXIS: YAXIS_DEFAULT});
    var n = PARAM(10, "N");
    var v = MA(SERIAL("close"), n);
    OUT_LINE(v, "ma", {COLOR: RED, WIDTH: 3});
};

function macd() {
    // DIFF : EMA(CLOSE,SHORT) - EMA(CLOSE,LONG);//短周期与长周期的收盘价的指数平滑移动平均值做差。
    // DEA  : EMA(DIFF,M);//DIFF的M个周期指数平滑移动平均
    // 2*(DIFF-DEA),COLORSTICK;//DIFF减DEA的2倍画柱状线
    DEFINE({TYPE: IKLINE, YAXIS: YAXIS_DEFAULT});
    //输入
    var vshort = PARAM(20, "SHORT", {MIN: 5, STEP: 5});
    var vlong = PARAM(35, "LONG", {MIN: 5, STEP: 5});
    var vm = PARAM(10, "M", {MIN: 5, STEP: 5});
    //计算
    var sclose = SERIAL("CLOSE");
    var diff = SUB(EMA(sclose, vshort), EMA(sclose, vlong));
    var dea = EMA(diff, vm);
    var bar = 2 * (diff - dea);
    //输出
    OUT_LINE(diff, "diff", {COLOR: RED});
    OUT_LINE(dea, "dea", {COLOR: BLUE, WIDTH: 2});
    OUT_BAR(bar, "bar", {COLOR: RED});
}

var ta_funcs = [ma, macd];




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
            eval(func_name + ' = function(){' + code + '}');
            var f = window[func_name];
            tm_update_class_define(f);
        }
        // 用户自定义指标
        for (var i = 0; i < CMenu.datas.length; i++) {
            var func_name = CMenu.datas[i].name;
            var code = CMenu.datas[i].draft.code;
            eval(func_name + ' = function(){' + code + '}');
            var f = window[func_name];
            tm_update_class_define(f);
        }
    }

    function tm_get_indicator_class_list() {
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
            "params": [],
        };
        DEFINE = function (options) {
            ta_class_define.type = options.TYPE;
            ta_class_define.yaxis = options.YAXIS;
        }
        PARAM = function (param_default_value, param_name, options) {
            var param_define = params.get(param_name);
            if (param_define === undefined) {
                param_define = {
                    "name": param_name,
                    "default": param_default_value,
                };
                if (!(options === undefined)) {
                    param_define.memo = options.MEMO;
                    param_define.min = options.MIN;
                    param_define.max = options.MAX;
                    param_define.step = options.STEP;
                }
                params.set(param_name, param_define);
            }
            return param_define;
        };
        SERIAL = function (selector) {
        };
        OUT_LINE = function () {
        };
        OUT_BAR = function () {
        };
        P = 0;
        ta_func();
        //指标信息格式整理
        params.forEach(function (value, key) {
            ta_class_define["params"].push(value)
        });
        ta_class_map[indicator_name] = ta_class_define;
        ta_class_define.aid = "register_indicator_class";
        //发送指标类信息到主进程
        WS.sendJson(ta_class_define);
    }

    function tm_set_indicator_class_list() {
    }

    function tm_recalc_indicators() {
        // 重计算有变更的指标值
        // @todo: 目前先做一个全部重算的版本, 待后续优化
        for (var instance_id in ta_instance_map) {
            var indicator_instance = ta_instance_map[instance_id];
            recalcInstance(indicator_instance);
        }
    }

    function get_instance_param_value(instance, param_name) {
        return instance.params[param_name];
    }

    function get_input_serial_func(instance, serial_selector) {
        return function (P) {
            //@todo: 现在serial_selector只支持简单格式
            return DM.get_kdata(instance.ins_id, instance.dur_nano, P, serial_selector, instance.instance_id);
        }
    }

    function recalcInstance(ta_instance) {
        // try {
        var xrange = DM.get_kdata_range(ta_instance.ins_id, ta_instance.dur_nano, ta_instance.instance_id);
        if (xrange === undefined)
            return;
        var [data_left, data_right] = xrange;
        //准备计算环境
        out_values = {};
        P = 0;
        PARAM = function (param_default_value, param_name) {
            return get_instance_param_value(ta_instance, param_name);
        };
        SERIAL = function (serial_selector) {
            return get_input_serial_func(ta_instance, serial_selector.toLowerCase());
        };
        var outSerial = function (style, serial_name, options) {
            out_values[serial_name] = out_values[serial_name] || {};
            var serial = out_values[serial_name];
            if (serial.style === undefined) {
                serial.values = {};
                serial.style = style;
                serial.width = 1;
                serial.color = RGB(0xFF, 0x00, 0x00);
                serial.yaxis = YAXIS_DEFAULT;
                if (options != undefined) {
                    if ('WIDTH' in options)
                        serial.width = options["WIDTH"];
                    if ('COLOR' in options)
                        serial.color = options["COLOR"];
                    if ('YAXIS' in options)
                        serial.yflags = options["YAXIS"];
                    if ('MEMO' in options)
                        serial.memo = options["MEMO"];
                }
            }
            //@todo: options
            return serial;
        };
        OUT_LINE = function (value, serial_name, options) {
            var serial = outSerial(LINE, serial_name, options);
            serial.values[P] = [value.valueOf()];
        };
        OUT_BAR = function (value, serial_name, options) {
            var serial = outSerial(BAR, serial_name, options);
            serial.values[P] = [value.valueOf()];
        };
        OUT_KLINE = function (vo, vh, vl, vc, serial_name, options) {
            var serial = outSerial(KLINE, serial_name, options);
            serial.values[P] = [vo.valueOf(), vh.valueOf(), vl.valueOf(), vc.valueOf()];
        };
        console.log(ta_instance.instance_id, "data_left", data_left);
        console.log(ta_instance.instance_id, "data_right", data_right);
        //@todo: 这里目前是对整个序列全部重算，后续需要优化(已经计算过，且原始数据未改变的不用重算；只计算可见窗口附近的数据)
        var func = window[ta_instance.ta_class_name];
        for (var i = data_left; i <= data_right; i++) {
            P = i;
            func();
        }
        //将计算结果发给主进程
        var pack = {
            aid: "set_indicator_data",
            instance_id: ta_instance.instance_id,
            epoch: ta_instance.epoch,
            serials: out_values,
        }
        WS.sendJson(pack);
    }

    function tm_set_indicator_instance(instance_pack) {
        var instance_id = instance_pack.instance_id;
        instance_pack.func = window[instance_pack.ta_class_name];
        ta_instance_map[instance_id] = instance_pack;
        setTimeout(() => {
            DM.reset_indicator_instance(instance_id);
            recalcInstance(instance_pack);
        }, 500);


    }

    function tm_recalc_indicator_by_id(instance_id) {
        recalcInstance(ta_instance_map[instance_id]);
    }

    return {
        init: tm_init,
        update_class_define: tm_update_class_define,
        get_indicator_class_list: tm_get_indicator_class_list,
        set_indicator_class_list: tm_set_indicator_class_list,
        recalc_indicators: tm_recalc_indicators,
        recalc_indicator_by_id: tm_recalc_indicator_by_id,
        set_indicator_instance: tm_set_indicator_instance,
    }
}();

