const IndicatorInstance = function (obj) {
    Object.assign(this, obj);
    this.rels = []; // 相关节点
    this.invalid = false; // 是否重新计算
    this.calculated_left = -1; // 已经计算数据 左边界
    this.calculated_right = -1; // 已经计算数据 右边界

    this.BEGIN = undefined;
    this.calculating_left = -1; // 即将计算数据 左边界
    this.calculating_right = -1; // 即将计算数据 右边界
}
IndicatorInstance.prototype.resetByInstance = function (obj) {
    Object.assign(this, obj);
    if (obj.ins_id === '' || obj.dur_nano === -1 || obj.view_left === -1 || obj.view_right === -1) {
        this.invalid = false;
    } else {
        this.invalid = true;
    }
    this.rels = [];
    this.calculated_left = -1;
    this.calculated_right = -1;
    this.BEGIN = undefined;
    this.calculating_left = -1;
    this.calculating_right = -1;
    this.calculate();
};
IndicatorInstance.prototype.getKCalcRange = function () {
    let path = this.ins_id + '.' + this.dur_nano;
    let [first_id, last_id] = DM.get_data_range(path);
    if (this.view_left > -1 && this.view_right > -1 && this.view_right >= first_id && this.view_left <= last_id && first_id < last_id ) {
        // view_left_right 和 全部数据范围 first_id, last_id 比较计算结果
        // 客户端想收到且能收到的数据范围
        let left_id = first_id > this.view_left ? first_id : this.view_left;
        let right_id = last_id < this.view_right ? last_id : this.view_right;
        // 再和 已经计算过的数据范围 比较
        if (this.calculated_left === -1 || this.calculated_right === -1) {
            this.calculated_left = left_id;
            this.calculated_right = right_id;
        } else {
            // 一共六种情况
            if (this.calculated_right <= left_id) {
                this.calculated_left = left_id;
                this.calculated_right = right_id;
            } else if (this.calculated_left <= left_id) {
                if (this.calculated_right <= right_id) {
                    left_id = this.calculated_right;
                    this.calculated_right = right_id;
                } else {
                    this.calculating_left = -1;
                    this.calculating_right = -1;
                }
            } else if (this.calculated_left <= right_id) {
                if (this.calculated_right <= right_id) {
                    this.calculated_left = left_id;
                    this.calculated_right = right_id;
                } else {
                    right_id = this.calculated_left;
                    this.calculated_left = left_id;
                }
            } else {
                this.calculated_left = left_id;
                this.calculated_right = right_id;
            }
        }
        this.calculating_left = left_id;
        this.calculating_right = right_id;
        return;
    }else{
        this.calculating_left = -1;
        this.calculating_right = -1;
    }
};
IndicatorInstance.prototype.addRelationship = function (path) {
    if (!this.rels.includes(path)) this.rels.push(path);
};
IndicatorInstance.prototype.setInvalidByPath = function (path) {
    if (!this.invalid && this.rels.includes(path)) this.invalid = true;
};
IndicatorInstance.prototype.resetInvalid = function () {
    this.invalid = false;
};
IndicatorInstance.prototype.update = function () {
    if (this.BEGIN < this.calculating_left) return;
    //准备计算环境
    this.BEGIN = this.calculating_left;
    this.DEFINE = function () {
    };
    this.PARAM = function (param_default_value, param_name) {
        return this.params[param_name].value;
    };
    this.SERIAL = function (serial_selector) {
        var selector = serial_selector.toLowerCase();
        var ds = DM.get_kdata_obj(this.ins_id, this.dur_nano, this.instance_id);
        return new Proxy({}, {
            get: function (target, key, receiver) {
                if (ds && ds[key]) {
                    return ds[key][selector];
                } else {
                    return NaN;
                }
            }
        });
    };
    this.out_series = {};
    this.out_datas = {};
    this.OUTS = function (style, serial_name, options) {
        this.out_series[serial_name] = {};
        var serial = this.out_series[serial_name];
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
        if (style == "KLINE") {
            var s = [new VALUESERIAL(), new VALUESERIAL(), new VALUESERIAL(), new VALUESERIAL()];
            this.out_datas[serial_name] = s;
            return s;
        } else {
            var s = new VALUESERIAL();
            this.out_datas[serial_name] = [s];
            return s;
        }
    };
    //重生成函数
    this.func = self[this.ta_class_name](this);
}
IndicatorInstance.prototype.exec = function () {
    //执行计算
    try {
        for (var i = this.calculating_left; i <= this.calculating_right; i++) {
            this.func.next(i);
        }
    } catch (e) {
        postMessage({
            cmd: 'error_class', content: {
                type: e.type,
                message: e.message,
                className: this.ta_class_name
            }
        });
        log(this.instance_id + e);
        return;
    }
    //整理计算结果
    for (var serial_name in this.out_datas) {
        var serial_from = this.out_datas[serial_name];
        for (var j in serial_from) {
            serial_from[j].setRange(this.calculating_left, this.calculating_right);
        }
    }
    //将计算结果发给主进程
    var pack = {
        aid: "set_indicator_data",
        instance_id: this.instance_id,
        epoch: this.epoch,
        range_left: this.calculating_left,
        range_right: this.calculating_right,
        serials: this.out_series,
        datas: this.out_datas,
    };
    WS.sendJson(pack);
}

IndicatorInstance.prototype.calculate = function () {
    if (this.invalid) {
        if (G_Error_Class_Name.indexOf(this.ta_class_name) > -1) {
            return;
        }
        var id = Keys.next().value;
        postMessage({
            cmd: 'calc_start', content: {
                id: id,
                className: this.ta_class_name
            }
        });
        this.getKCalcRange();
        if (this.calculating_left === -1 || this.calculating_right === -1) {
            return;
        }
        this.update();
        this.exec();
        this.invalid = false;
        postMessage({
            cmd: 'calc_end', content: {
                id: id,
                className: this.ta_class_name
            }
        });
    }
}

function* GenerateKey() {
    var i = 0;
    while (true) {
        yield i.toString(36);
        i++;
    }
}

const COLOR = function (r, g, b) {
    this.color = r | (g << 8) | (b << 16);
}

COLOR.prototype.toJSON = function () {
    return this.color;
};

const RGB = function (r, g, b) {
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


function VALUESERIAL() {
    this.LEFT = 0;
    this.RIGHT = 0;
}

VALUESERIAL.prototype.toJSON = function () {
    var n = new Array();
    for (var i = this.LEFT; i <= this.RIGHT; i++) {
        n[i - this.LEFT] = this[i];
    }
    return n;
};

VALUESERIAL.prototype.setRange = function (left, right) {
    this.LEFT = left;
    this.RIGHT = right;
};