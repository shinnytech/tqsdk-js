var ta_instance_map = {};

    function SUM2(func, N, P) {
        var v = 0;
        for (var i = 0; i < N; i++) {
            if (P > i) {
                v = v + func(P - i)
            }
        }
        return v;
    }

//atyle2---------------------------------------------------------------------------
//BR: SUM(MAX(0, HIGH - REF(CLOSE, 1)), N) / SUM(MAX(0, REF(CLOSE, 1) - LOW), N) * 100;//取最高价减去一个周期前的收盘价的与0中的最大值，求和，取一个周期前的收盘价减去最低价与0中的最大值，求和，两个和的百分比
    function br2(shigh, slow, sclose, n, P) {
        return SUM2(function (P) {
                return Math.max(shigh(P) - sclose(P - 1), 0);
            }, n, P)
            / SUM2(function (P) {
                return Math.max(sclose(P - 1) - slow(P), 0);
            }, n, P);
    }

    function arbr2(C) {
//        C.OUT("BR", br2(C.IN("HIGH"), C.IN("LOW"), C.IN("CLOSE"), C.PARAM("N"), C.P));
        C.OUT("BR", C.IN("HIGH")(C.P) + 5);
    };

// ---------------------------------------------------------------------------


(function () {

    function tm_init() {
        //todo: 初始化
        ta_instance_map[1] = {
            "instance_id": 1,
            "epoch":	3,
            "func": arbr2,
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
            console.log("calc:" + i);
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

