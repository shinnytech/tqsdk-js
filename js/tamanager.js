(function () {

    function tm_init() {
        //todo: 初始化
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
        for (var i=0; i<Indicator.Instances.length; i++) {
            var indicator = Indicator.Instances[i];
            console.log('start === ', indicator.name, new Data());
            recalcInstance(Indicator.Instances[i]);
        }




    }

    function SUM2(func, N, P) {
        var v = 0;
        for (var i = 0; i < N; i++) {
            if (P > i) {
                v = v + func(P - i)
            }
        }
        return v;
    }

    function OutSerial(C, serial_name, value) {
        C.OUT[C.P][serial_name] = value;
    };


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
        OutSerial("BR", br2(C.IN("HIGH"), C.IN("LOW"), C.IN("CLOSE"), C.PARAM("N"), C.P));
    };

// ---------------------------------------------------------------------------

    function recalcInstance(ta_instance) {
        /*
            ta_instance = {
                "func": arbr2,
                "params": {
                    "N": 50,
                }
            }
        */
        context = {
            "P": 30,
            "IN": function (serial_selector) {
                return function (P) {
                    return serial[P][serial_selector];
                }
            },
            "OUT": {},
            "PARAM": function (param_name) {
                return {
                    "N": 50,
                }[param_name];
            },
        }
        for (var i = 0; i < 1000; i++) {
            context["P"] = i;
            ta_instance["func"](context);
        }
    }

    this.TM = {
        ta_instance_map: {},
        init: tm_init,
        get_indicator_class_list: tm_get_indicator_class_list,
        set_indicator_class_list: tm_set_indicator_class_list,
        recalc_indicators: tm_recalc_indicators,
    }
}());

