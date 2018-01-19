const IndicatorInstance = function (obj) {
    Object.assign(this, obj);
    this.rels = []; // 相关节点
    this.invalid = false; // 是否重新计算
    this.BEGIN = -1;
    this.calculateLeft = -1;
    this.calculateRight = -1;
    this.runId = -1;
};

IndicatorInstance.prototype.resetByInstance = function (obj) {
    Object.assign(this, obj);
    if (obj.ins_id === '' || obj.dur_nano === -1 || obj.view_left === -1 || obj.view_right === -1) {
        this.invalid = false;
    } else {
        this.invalid = true;
    }

    this.rels = [];
    this.BEGIN = -1;
    this.calculateLeft = -1;
    this.calculateRight = -1;
    this.calculate();
};

IndicatorInstance.prototype.updateRange = function () {
    let path = this.ins_id + '.' + this.dur_nano;
    let { firstId, lastId } = DM.get_data_range(path);
    if (this.view_left > -1 && this.view_right > -1 && this.view_right >= firstId
        && this.view_left <= lastId && firstId < lastId) {
        // view_left view_right 和 已有全部数据范围 firstId, lastId 有交集
        let leftId = firstId > this.view_left ? firstId : this.view_left;
        let rightId = lastId < this.view_right ? lastId : this.view_right;
        if (this.BEGIN === -1 || this.BEGIN > this.view_left) {
            this.BEGIN = leftId;
            this.calculateLeft = leftId;
            this.calculateRight = rightId;
            this.update(); // 重新定义函数
        } else {
            this.calculateRight = rightId;
        }
    } else {
        // view_left view_right 和 已有全部数据范围 firstId, lastId 无交集
        this.BEGIN = -1;
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
    //准备计算环境
    this.DEFINE = function () {
    };

    this.PARAM = function (defaultValue, name) {
        return this.params[name].value;
    };

    this.SERIAL = function (serialSelector) {
        var selector = serialSelector.toLowerCase();
        var ds = DM.get_kdata_obj(this.ins_id, this.dur_nano, this.instance_id);
        var path = this.ins_id + '.' + this.dur_nano;
        G_INSTANCES[this.instance_id].addRelationship(path);
        return new Proxy({}, {
            get: function (target, key, receiver) {
                if (ds && ds[key]) {
                    return ds[key][selector];
                } else {
                    return NaN;
                }
            },
        });
    };

    this.out_series = {};
    this.out_datas = {};
    this.OUTS = function (style, serialName, options) {
        this.out_series[serialName] = {};
        let serial = this.out_series[serialName];
        serial.style = style;
        serial.width = 1;
        serial.color = RGB(0xFF, 0x00, 0x00);
        serial.yaxis = 0;
        if (options) {
            serial.width = options.width ? options.width : serial.width;
            serial.color = options.color ? options.color : serial.color;
            serial.yaxis = options.yaxis ? options.yaxis : serial.yaxis;
            serial.memo = options.memo ? options.memo : serial.memo;
        }

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
    };

    //重生成函数
    this.func = self[this.ta_class_name](this);
};

IndicatorInstance.prototype.postEndMessage = function () {
    postMessage({
        cmd: 'calc_end', content: {
            id: this.runId,
            className: this.ta_class_name,
        },
    });
}    

IndicatorInstance.prototype.exec = function () {
    //执行计算calculateRight
    var [left, right] = [this.calculateLeft, this.calculateRight];
    try {
        for (; this.calculateLeft <= this.calculateRight; this.calculateLeft++) {
            this.func.next(this.calculateLeft);
        }

        this.calculateLeft--;
    } catch (e) {
        this.postEndMessage();
        postMessage({
            cmd: 'feedback', content: {
                error: true,
                type: 'run',
                message: e.message,
                func_name: this.ta_class_name,
            },
        });
        return;
    };

    //整理计算结果
    for (var serial in this.out_datas) {
        var valueSerail = this.out_datas[serial];
        for (var j in valueSerail) {
            valueSerail[j].setRange(left, right);
        }
    };

    //将计算结果发给主进程
    var pack = {
        aid: 'set_indicator_data',
        instance_id: this.instance_id,
        epoch: this.epoch,
        range_left: left,
        range_right: right,
        serials: this.out_series,
        datas: this.out_datas,
    };
    WS.sendJson(pack);
};

IndicatorInstance.prototype.calculate = function () {
    if (this.invalid) {
        if (G_ERRORS.indexOf(this.ta_class_name) > -1) {
            return;
        }

        this.runId = Keys.next().value;
        postMessage({
            cmd: 'calc_start', content: {
                id: this.runId,
                className: this.ta_class_name,
            },
        });

        this.updateRange();
        if (this.BEGIN === -1) {
            this.postEndMessage();
            return;
        }

        this.exec();
        this.invalid = false;
        this.postEndMessage();
    }
};

function* GenerateKey() {
    let i = 0;
    while (true) {
        yield i.toString(36);
        i++;
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
