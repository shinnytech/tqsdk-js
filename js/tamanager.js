// ---------------------------------------------------------------------------
function ma(C) {
    C.OUT("BR", C.IN("HIGH")(C.P) + C.PARAM("N"));
};
function macd(C) {
    C.IN("CLOSE").setMemo("this is close");
    C.OUT("BR", C.IN("CLOSE")(C.P) + C.PARAM("N")).setColor(123).setWidth(4);
};
var ta_funcs = [ma, macd];
// ---------------------------------------------------------------------------

function ParamDefine(name){
    var f = function(){return 123};
    f.sname = name;
    f.memo = "";
    f.default_value = NaN;
    f.min_value = NaN;
    f.max_value = NaN;
    f.setMemo = function(memo){
        f.memo = memo;
        return f;
    };
    f.setDefault = function(default_value){
        f.default_value = default_value;
        return f;
    };
    f.setMin = function(min_value){
        f.min_value = min_value;
        return f;
    };
    f.setMax = function(max_value){
        f.max_value = max_value;
        return f;
    };
    return f;
}

function InputSerialDefine(name) {
    var f = function(){return 123};
    f.sname = name;
    f.memo = "";
    f.selector = name;
    f.setMemo = function(memo){
        f.memo = memo;
        return f;
    };
    return f;
};

function OutputSerialDefine(name) {
    var f = function(){return 123};
    f.sname = name;
    f.memo = "";
    f.style = 0;
    f.color = 0;
    f.width = 1;
    f.yaxis = 0;
    f.setMemo = function(memo){
        f.memo = memo;
        return f;
    };
    f.setStyle = function(style){
        f.style = style;
        return f;
    };
    f.setColor = function(color){
        f.color = color;
        return f;
    };
    f.setWidth = function(width){
        f.width = width;
        return f;
    };
    f.setAxis = function(axis){
        f.axis = axis;
        return f;
    };
    return f;
};


var ta_instance_map = {};
var ta_class_map = {};

(function () {

    function tm_init() {
        //todo: 初始化
        //更新所有指标类定义, 并发送到主进程
        for (var i = 0; i < ta_funcs.length; i++) {
            var f = ta_funcs[i];
            tm_update_class_define(f);
        }
        ta_instance_map[1] = {
            "ta_class_name": "ma",
            "instance_id": 1,
            "epoch": 3,
            "params": {
                //system params
                "_INS_ID": "IF1709",
                "_DUR_NANO": 3600000000000,
                //user params
                "N": 3123,
            },
            "input_serials": {
                "HIGH":{
                    "ins_id": "IF1709",
                    "serial_id": "high"
                },
                "LOW":{
                    "ins_id": "IF1709",
                    "serial_id": "low"
                },
                "CLOSE":{
                    "ins_id": "IF1709",
                    "serial_id": "close"
                }
            },
        };
    }

    function tm_get_indicator_class_list() {
        /*
        //todo: 提取所有指标类的描述信息
            每个指标发送以下包:
            {
              aid: register_indicator,
              register_indicator: {
                name: "MACD",
                memo: "this is macd",
                params: [
                    {
                       "name": "M",
                       "default_value": 3023,
                       "min_value": 2302,
                       "memo": "this is M",
                    },
                ],
                input_serials: [
                    {
                        "selector": "OPEN.cu1703",
                        "reassign": 0,
                        "memo": "this is M",
                    },
                ],
                output_serials: [
                    {
                        "name": "diff",
                        "yaxis": 0,
                        "style": "LINE",
                        "width": 3,
                        "color": "AUTO",
                    }
                ],
            }
        */
    }

    function tm_update_class_define(ta_func){
        var indicator_name = ta_func.name;
        //调用指标函数，提取指标信息
        var params = new Map();
        var input_serials = new Map();
        var output_serials = new Map();
        var context_define = {
            "P": 0,
            "PARAM": function (param_name) {
                var param_define = params.get(param_name);
                if(param_define === undefined){
                    param_define = ParamDefine(param_name);
                    params.set(param_name, param_define);
                }
                return param_define;
            },
            "IN": function (serial_selector) {
                var input_serial_define = input_serials.get(serial_selector);
                if(input_serial_define === undefined){
                    input_serial_define = InputSerialDefine(serial_selector);
                    input_serials.set(serial_selector, input_serial_define);
                }
                return input_serial_define;
            },
            "OUT": function(serial_name, value){
                var output_serial_define = output_serials.get(serial_name);
                if(output_serial_define === undefined){
                    output_serial_define = OutputSerialDefine(serial_name);
                    output_serials.set(serial_name, output_serial_define);
                }
                return output_serial_define;
            },
        }
        ta_func(context_define);
        //指标信息格式整理
        ta_class_define = {
            "name": indicator_name,
            "params": [],
            "input_serials": [],
            "output_serials": [],
        };
        params.forEach(function(value, key) {
            ta_class_define["params"].push({
                "name": value["sname"],
                "memo": value["memo"],
                "default_value": value["default_value"],
                "min_value": value["min_value"],
                "max_value": value["max_value"],
            })
        });
        input_serials.forEach(function(value, key) {
            ta_class_define["input_serials"].push({
                "name": value["sname"],
                "memo": value["memo"],
                "selector": value["selector"],
            })
        });
        output_serials.forEach(function(value, key) {
            ta_class_define["output_serials"].push({
                "name": value["sname"],
                "memo": value["memo"],
                "style": value["style"],
                "color": value["color"],
                "width": value["width"],
                "yaxis": value["yaxis"],
            })
        });
        ta_class_map[indicator_name] = ta_class_define;
        //@todo: 发送到主进程
        var j = JSON.stringify(ta_class_define);
        console.log("finish define:"+j);
    }

    function tm_set_indicator_class_list() {
    }

    function tm_recalc_indicators() {
        // 重计算有变更的指标值
        // @todo: 目前先做一个全部重算的版本, 待后续优化
        return;
        for (var instance_id in ta_instance_map) {
            var indicator_instance = ta_instance_map[instance_id];
            console.log('start === ', instance_id);
            recalcInstance(indicator_instance);
        }
    }

    function get_instance_param_value(instance, param_name){
        return instance.params[param_name];
    }
    function get_input_serial_func(instance, serial_selector){
        var d = instance.input_serials[serial_selector];
        return function (P) {
            return DM.get_kdata(d.ins_id, instance.params._DUR_NANO, P, d.serial_id);
        }
    }
    function recalcInstance(ta_instance) {
        /*
            ta_instance = {
                "func": arbr2,
                "params": {
                    "N": 50,
                }
            }
        */
        context_calc = {
            "P": 0,
            "IN": function (serial_selector) {
                return get_input_serial_func(ta_instance, serial_selector);
            },
            "OUT": function(serial_name, value){
                context_calc.out_values[context_calc.P] = context_calc.out_values[context_calc.P] || {};
                context_calc.out_values[context_calc.P][serial_name] = value;
            },
            "PARAM": function (param_name) {
                return get_instance_param_value(ta_instance, param_name);
            },
            "out_values": {}
        }
        var [data_left, data_right] = DM.get_kdata_range(ta_instance.params._INS_ID, ta_instance.params._DUR_NANO);
        console.log("data_left" + data_left);
        console.log("data_right" + data_right);
        //@todo: 这里目前是对整个序列全部重算，后续需要优化(已经计算过，且原始数据未改变的不用重算；只计算可见窗口附近的数据)
        for (var i = data_left; i <= data_right; i++) {
            // console.log("calc:" + i);
            context_calc["P"] = i;
            window[ta_instance.ta_class_name](context_calc);
        }
        console.log("finish" + context_calc.out_values);
        //@todo: 还需要将计算结果发给主进程
    }

    function tm_set_indicator_instance(instance_pack){
        var instance_id = instance_pack.id;
        instance_pack.func = window[instance_pack.ta_class_name];
        ta_instance_map[instance_id] = instance_pack;
        recalcInstance(instance_pack);
    }

    this.TM = {
        init: tm_init,
        get_indicator_class_list: tm_get_indicator_class_list,
        set_indicator_class_list: tm_set_indicator_class_list,
        recalc_indicators: tm_recalc_indicators,
        set_indicator_instance: tm_set_indicator_instance,
    }
}());

