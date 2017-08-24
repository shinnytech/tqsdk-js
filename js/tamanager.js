// ---------------------------------------------------------------------------
function ma(C) {
    C.OUT("BR", C.IN("HIGH")(C.P) + C.PARAM("N"));
};
function macd(C) {
    C.IN("CLOSE").setMemo("this is close");
    C.OUT("BR", C.IN("CLOSE")(C.P) + C.PARAM("N"));
};
var ta_funcs = [ma];
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
        f.style = color;
        return f;
    };
    f.setWidth = function(width){
        f.style = width;
        return f;
    };
    f.setAxis = function(axis){
        f.style = axis;
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
            "instance_id": 1,
            "epoch":	3,
            "func": ma,
            "params": {
                "N": 3123,
            },
            "xaxis":{
                "ins_id": "IF1709",
                "dur_id": 3600000000000,
            },
            "input_serials": {
                "HIGH":{
                    "ins_id": "IF1709",
                    "dur_id": 3600000000000,
                    "serial_id": "high"
                },
                "LOW":{
                    "ins_id": "IF1709",
                    "dur_id": 3600000000000,
                    "serial_id": "low"
                },
                "CLOSE":{
                    "ins_id": "IF1709",
                    "dur_id": 3600000000000,
                    "serial_id": "close"
                }
            },
            "output_serials":	[{
                "name":	"diff",
                "style":	1,
                "color":	1,
                "width":	3,
                "yflags":	0
            }]
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
        let indicator_name = ta_func.name;
        ta_class_map[indicator_name] = {
            "name": indicator_name,
            "params": [],
            "input_serials": [],
            "output_serials": [],
        };
        let class_define = ta_class_map[indicator_name];
        context_define = {
            "P": 0,
            "PARAM": function (param_name) {
                var param_define = ParamDefine(param_name);
                class_define.params.push(param_define);
                return param_define;
            },
            "IN": function (serial_selector) {
                var input_serial_define = InputSerialDefine(serial_selector);
                class_define.input_serials.push(input_serial_define);
                return input_serial_define;
            },
            "OUT": function(serial_name, value){
                var output_serial_define = OutputSerialDefine(serial_name);
                class_define.output_serials.push(output_serial_define);
                return output_serial_define;
            },
        }
        ta_func(context_define);
        console.log("finish define");
    }

    function tm_set_indicator_class_list() {
    }

    function tm_recalc_indicators() {
        //重计算有变更的指标值，目前先做一个全部重算的版本
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
            return DM.get_kdata(d.ins_id, d.dur_id, P, d.serial_id);
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
        var [data_left, data_right] = DM.get_kdata_range(ta_instance.xaxis.ins_id, ta_instance.xaxis.dur_id);
        console.log("data_left" + data_left);
        console.log("data_right" + data_right);
        for (var i = data_left; i <= data_right; i++) {
            // console.log("calc:" + i);
            context_calc["P"] = i;
            ta_instance["func"](context_calc);
        }
        console.log("finish" + context_calc.out_values);
    }

    function tm_set_indicator_instance(instance_pack){
        var instance_id = instance_pack["id"];
        ta_instance_map[instance_id] = instance_pack;
        recalcInstance(ta_instance_map[instance_id]);
    }

    this.TM = {
        init: tm_init,
        get_indicator_class_list: tm_get_indicator_class_list,
        set_indicator_class_list: tm_set_indicator_class_list,
        recalc_indicators: tm_recalc_indicators,
        set_indicator_instance: tm_set_indicator_instance,
    }
}());

