// 不同的 kline 手动设置 kline_id
TQ.GET_KSequence = function ({ kline_id = RandomStr(), ins_id, duration, width = 100 } = {}) {
    if (!ins_id || !duration) return undefined;
    WS.sendJson({
        "aid": "set_chart",
        "chart_id": kline_id,
        "ins_list": ins_id,
        "duration": duration,
        "view_width": width, // 默认为 100
    });
    return new Proxy({ kline_id, ins_id, duration, width }, {
        get: function (target, key, receiver) {
            if (key in target) return target[key];
            let kdata = DM.get_kdata_obj(ins_id, duration);
            var chart = DM.datas.charts[kline_id];
            if (kdata && chart && chart.left_id > -1 && chart.right_id > -1) {
                if (['datetime', 'open', 'high', 'low', 'close', 'volume', 'open_oi', 'close_oi'].includes(key)) {
                    var list = [];
                    for (var i = chart.left_id; i <= chart.right_id; i++) {
                        list.push(kdata[i][key]);
                    }
                    return list;
                } else if (!isNaN(key)) {
                    if (key < 0) return kdata[chart.right_id + 1 + Number(key)];
                    return kdata[chart.left_id + Number(key)];
                }

            }
            return undefined;
        }
    });
}

/**
 * 
 * @param {object} kseq  
 *              // ins_id: TQ.UI.symbol,
                // duration: TQ.UI.duration,
                // width: 100
 * @param {string} ta_class_name 
 * @param {object} params 
 */
TQ.GET_Indicator = function (id, kseq, ta_class_name, params) {
    var chart = DM.datas.charts[kseq.kline_id];

    var indicator = {};
    if (chart) {
        indicator = new Indicator({
            "ta_class_name": ta_class_name,              //必填, 指标实例ID，每个指标实例都有唯一的实例ID号
            ins_id: kseq.ins_id,
            dur_nano: kseq.duration,
            view_left: chart.left_id,
            view_right: chart.right_id,
            params
        });
    }

    function cal_indicator() {
        if (!chart) {
            chart = DM.datas.charts[kseq.kline_id];
            if (chart) {
                indicator = new Indicator({
                    "ta_class_name": ta_class_name,              //必填, 指标实例ID，每个指标实例都有唯一的实例ID号
                    ins_id: kseq.ins_id,
                    dur_nano: kseq.duration,
                    view_left: chart.left_id,
                    view_right: chart.right_id,
                    params
                });
            }
        } else {
            if (indicator.view_left != chart.left_id || indicator.view_right != chart.right_id) indicator.updateRange(chart.left_id, chart.right_id);
            indicator.calculate();
        }

    }

    return new Proxy(indicator, {
        get: function (target, key, receiver) {
            if (key in target) return target[key];

            cal_indicator();

            if (indicator.out_datas) {
                var out_datas_keys = Object.keys(indicator.out_datas);
                if (out_datas_keys.includes(key)) {
                    var list = [];
                    for (var id = indicator.view_left; id <= indicator.view_right; id++) {
                        var len = indicator.out_datas[key].length;
                        if (len === 1) {
                            list.push(indicator.out_datas[key][0][id])
                        } else if (len > 1) {
                            var serail = [];
                            for (var i in indicator.out_datas[key]) {
                                serail.push(indicator.out_datas[key][i][id])
                            }
                            list.push(serail);
                        }
                    }
                    return list;
                } else if (!isNaN(key)) {
                    var id = indicator.view_left + parseInt(key);
                    if (key < 0) {
                        id = indicator.view_right + parseInt(key) + 1;
                    }
                    var obj = {};
                    for (var k of out_datas_keys) {
                        var len = indicator.out_datas[k].length;
                        if (len === 1) {
                            obj[k] = indicator.out_datas[k][0][id];
                        } else if (len > 1) {
                            obj[k] = [];
                            for (var i in indicator.out_datas[k]) {
                                obj[k].push(indicator.out_datas[k][i][id])
                            }
                        }
                    }
                    return obj;
                }
                return undefined;
            }
            return undefined;
        }
    });

}

// var KSequence = getKSequence({ ins_id, dur_nano, width });
// console.log(KSequence.open)
// KSequence.get()
// KSequence.datetime //UnixNano 北京时间，如果是日线，则是交易日的 UnixNano
// KSequence.open //开
// KSequence.high //高
// KSequence.low //低
// KSequence.close //收
// KSequence.volume //成交量
// KSequence.open_oi //起始持仓量
// KSequence.close_oi //结束持仓量

/**
 * obj 对象必须的字段 
 * {    "ta_class_name": "MACD",
 *      "instance_id": "abc324238", 
 *      "epoch": 1234,          
 *      "ins_id": "SHFE.cu1805",
 *      "dur_nano": 60000000000,
 *      "view_left": 1000,
 *      "view_right": 3000,     
 *      "params": {     
 *          "N": {"value": 30},
 *          "S": {"value": "abcd"},
 * }
 */

class Indicator {
    constructor(config) {

        this.ctx = {
            DEFINE: () => { },
            PARAM: (defaultValue, name) => this.params[name].value,
            SERIAL: (serialSelector) => {
                var selector = serialSelector.toLowerCase();
                var ds = DM.get_kdata_obj(this.ins_id, this.dur_nano);
                return new Proxy({}, {
                    get: function (target, key, receiver) {
                        if (ds && ds[key]) {
                            return ds[key][selector];
                        } else {
                            return NaN;
                        }
                    },
                });
            },
            OUTS: (style, serialName, options) => {
                this.out_series[serialName] = {};
                let serial = this.out_series[serialName];
                serial.style = style;
                serial.width = 1;
                serial.color = RGB(0xFF, 0x00, 0x00);
                serial.yaxis = 0;
                if (options) Object.assign(serial, options);
                if (style === 'KLINE') {
                    let s = [new VALUESERIAL(), new VALUESERIAL(), new VALUESERIAL(), new VALUESERIAL()];
                    this.out_datas[serialName] = s;
                    return s;
                } else if (style === 'COLOR_BAR') {
                    let s = [new VALUESERIAL(), new VALUESERIAL()];
                    this.out_datas[serialName] = s;
                    return s;
                } else {
                    let s = new VALUESERIAL();
                    this.out_datas[serialName] = [s];
                    return s;
                }
            }
        }; // this.ctx

        this.reset(config)
    }

    reset(config) {
        this.ins_id = config.ins_id;
        this.dur_nano = config.dur_nano;
        this.ta_class_name = config.ta_class_name;
        this.params = config.params;

        this.view_left = config.view_left;
        this.view_right = config.view_right;

        this.out_series = {};
        this.out_datas = {};

        this.BEGIN = -1;
        this.calculateLeft = -1;
        this.calculateRight = -1;
        this.func = self[this.ta_class_name](this.ctx);
    }

    /**
     * 只修改 view_left、view_right
     */
    updateRange(view_left, view_right) {
        if (view_left && view_right) {
            if (view_left == this.view_left && view_right == this.view_right) return;
            this.view_left = view_left;
            this.view_right = view_right;
        }

        var ds = DM.get_kdata_obj(this.ins_id, this.dur_nano);
        if (ds && this.view_left > -1 && this.view_right > -1) {
            var id_arr = Object.keys(ds).map(x => parseInt(x)).sort((a, b) => a - b);

            var start_id = -1;
            var i = 0;
            for (; i < id_arr.length; i++) {
                var id = id_arr[i];
                if (id >= this.view_left) {
                    start_id = id;
                    i++;
                    break;
                }
            }
            if (start_id == -1) {
                this.BEGIN = -1;
                return;
            }
            var end_id = start_id;
            for (; i < id_arr.length; i++) {
                if (id_arr[i] != end_id + 1) break;
                end_id = id_arr[i];
                if (end_id >= this.view_right) break;
            }
            if (this.BEGIN == -1 || this.BEGIN > this.view_left) {
                this.BEGIN = start_id;
                this.calculateLeft = start_id;
                this.calculateRight = end_id;

                this.out_series = {};
                this.out_datas = {};
            } else {
                this.calculateRight = end_id;
            }
        } else {
            this.BEGIN = -1;
            return;
        }
    }

    calculate() {
        this.updateRange();
        if (this.BEGIN === -1) return null;

        // 执行计算calculateRight
        var [left, right] = [this.calculateLeft, this.calculateRight];
        for (; this.calculateLeft <= this.calculateRight; this.calculateLeft++) {
            this.func.next(this.calculateLeft);
        }
        this.calculateLeft--;
    }
}

const COLOR = function (r, g, b) {
    this.color = r | (g << 8) | (b << 16);
};

COLOR.prototype.toJSON = function () {
    return this.color;
};

const RGB = function (r, g, b) {
    return new COLOR(r, g, b);
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

const VALUESERIAL = function () {
    this.LEFT = 0;
    this.RIGHT = 0;
};

VALUESERIAL.prototype.toJSON = function () {
    let n = [];
    for (let i = this.LEFT; i <= this.RIGHT; i++) {
        n[i - this.LEFT] = this[i];
    }

    return n;
};

VALUESERIAL.prototype.setRange = function (left, right) {
    this.LEFT = left;
    this.RIGHT = right;
};









