const IndicatorInstance = function (obj) {
    Object.assign(this, obj);
    this.rels = []; // 相关节点
    this.invalid = false; // 是否重新计算
    this.BEGIN = -1;
    this.last_i = -1;
    this.long_position_volume = 0;
    this.short_position_volume = 0;
    this.calculateLeft = -1;
    this.calculateRight = -1;
    this.runId = -1;
};

const RandomStr = function (prefix = "", len = 8) {
    var charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var s = '';
    for (var i = 0; i < len; i++) s += charts[Math.random() * 0x3e | 0];
    if (prefix)
        return prefix + s;
    else
        return s;
}

function ParseSymbol(str) {
    var match_arr = str.match(/([^\.]+)\.(.*)/);
    return {
        exchange_id: match_arr ? match_arr[1] : '',// 交易所代码
        instrument_id: match_arr ? match_arr[2] : ''// 合约代码
    }
}

IndicatorInstance.prototype.resetByInstance = function (obj) {
    Object.assign(this, obj);
    if (obj.ins_id === '' || obj.dur_nano === -1 || obj.view_left === -1 || obj.view_right === -1) {
        this.invalid = false;
    } else {
        this.invalid = true;
    }
    this.rels = [];
    this.BEGIN = -1;
    this.last_i = -1;
    this.long_position_volume = 0;
    this.short_position_volume = 0;
    this.calculateLeft = -1;
    this.calculateRight = -1;
    this.calculate();
};

IndicatorInstance.prototype.updateRange = function () {
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
            if (id_arr[i] > this.view_right) break;
            else end_id = id_arr[i];
        }
        if (this.BEGIN == -1 || this.BEGIN > start_id) {
            this.BEGIN = start_id;
            this.calculateLeft = start_id;
            this.calculateRight = end_id;
            this.update(); // 重新定义函数
        } else {
            this.calculateRight = end_id;
        }
    } else {
        this.BEGIN = -1;
        return;
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
        var ds = DM.get_kdata_obj(this.ins_id, this.dur_nano);
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
    // 重新定义函数时，删除指标自带的输出序列（Mark）
    delete this.out_series_mark;

    this.ORDER = function (direction, offset, volume, order_symbol = this.trade_symbol) {
        if (!this.out_series_mark) {
            this.out_series_mark = this.OUTS('MARK', 'mk');
        }
        var current_i = this.calculateLeft;
        var kobj = DM.get_data('klines/' + this.ins_id + '/' + this.dur_nano);
        if (kobj && kobj.last_id != -1 && current_i < kobj.last_id){
            // last_id 之前都要计算
            this.out_series_mark[this.calculateLeft] = direction === "BUY" ? ICON_BUY : ICON_SELL;
        }
        if (!this.enable_trade)
            return;
        if (current_i <= this.last_i || !kobj || !kobj.data || !kobj.last_id || kobj.last_id != current_i + 1)
            return;
        //@note: 代码跑到这里时, i应该是首次指向序列的倒数第二个柱子
        this.last_i = current_i;
        if (!order_symbol)
            order_symbol = this.ins_id;
        let quote = DM.get_data('quotes/' + order_symbol);

        let price_field = direction == "BUY" ? 'ask_price1' : 'bid_price1';
        if (!quote[price_field]) // 取不到对应的价格 包括 NaN 、 undefined
            return;
        let limit_price = quote[price_field];
        var { exchange_id, instrument_id } = ParseSymbol(order_symbol);
        if (offset == "CLOSE" || offset == "CLOSEOPEN") {
            if (direction == "BUY") {
                volume_close = Math.min(this.short_position_volume, volume);
                this.short_position_volume -= volume_close;
            } else {
                volume_close = Math.min(this.long_position_volume, volume);
                this.long_position_volume -= volume_close;
            }
            if (volume_close > 0) {
                let order_id = RandomStr(this.order_id_prefix);
                var pack = {
                    aid: 'insert_order',
                    order_id: order_id,  //必填, 委托单号, 需确保在一个账号中不重复, 限长512字节
                    exchange_id: exchange_id,          //必填, 下单到哪个交易所
                    instrument_id: instrument_id,      //必填, 下单合约代码
                    direction: direction,             //必填, 下单买卖方向
                    offset: "CLOSE",               //可选, 下单开平方向, 当指令相关对象不支持开平机制(例如股票)时可不填写此字段
                    volume: volume_close,                    //必填, 下单手数
                    price_type: "LIMIT",          //必填, 报单价格类型
                    limit_price: limit_price,           //当 price_type == LIMIT 时需要填写此字段, 报单价格
                };
                WS.sendJson(pack);
            }
        }
        if (offset == "OPEN" || offset == "CLOSEOPEN") {
            if (direction == "BUY") {
                if (this.volume_limit) {
                    if (this.volume_limit > this.long_position_volume)
                        volume_open = Math.min(this.volume_limit - this.long_position_volume, volume);
                    else
                        volume_open = 0;
                } else {
                    volume_open = volume;
                }
                this.long_position_volume += volume_open;
            } else {
                if (this.volume_limit) {
                    if (this.volume_limit > this.short_position_volume)
                        volume_open = Math.min(this.volume_limit - this.short_position_volume, volume);
                    else
                        volume_open = 0;
                } else {
                    volume_open = volume;
                }
                this.short_position_volume += volume_open;
            }
            if (volume_open > 0) {
                let order_id = RandomStr(this.order_id_prefix);
                var pack = {
                    aid: 'insert_order',
                    order_id: order_id,  //必填, 委托单号, 需确保在一个账号中不重复, 限长512字节
                    exchange_id: exchange_id,          //必填, 下单到哪个交易所
                    instrument_id: instrument_id,      //必填, 下单合约代码
                    direction: direction,             //必填, 下单买卖方向
                    offset: "OPEN",               //可选, 下单开平方向, 当指令相关对象不支持开平机制(例如股票)时可不填写此字段
                    volume: volume_open,                    //必填, 下单手数
                    price_type: "LIMIT",          //必填, 报单价格类型
                    limit_price: limit_price,           //当 price_type == LIMIT 时需要填写此字段, 报单价格
                };
                WS.sendJson(pack);
            }
        }
        if (offset == "AUTO") {
            if (direction == "BUY") {
                volume_close = Math.min(this.short_position_volume, volume);
                this.short_position_volume -= volume_close;
            } else {
                volume_close = Math.min(this.long_position_volume, volume);
                this.long_position_volume -= volume_close;
            }
            if (volume_close > 0) {
                let order_id = RandomStr(this.order_id_prefix);
                pack = {
                    aid: 'insert_order',
                    order_id: order_id,  //必填, 委托单号, 需确保在一个账号中不重复, 限长512字节
                    exchange_id: exchange_id,          //必填, 下单到哪个交易所
                    instrument_id: instrument_id,      //必填, 下单合约代码
                    direction: direction,             //必填, 下单买卖方向
                    offset: "CLOSE",               //可选, 下单开平方向, 当指令相关对象不支持开平机制(例如股票)时可不填写此字段
                    volume: volume_close,                    //必填, 下单手数
                    price_type: "LIMIT",          //必填, 报单价格类型
                    limit_price: limit_price,           //当 price_type == LIMIT 时需要填写此字段, 报单价格
                };
                WS.sendJson(pack);
            }
            volume -= volume_close;
            if (direction == "BUY") {
                if (this.volume_limit) {
                    if (this.volume_limit > this.long_position_volume)
                        volume_open = Math.min(this.volume_limit - this.long_position_volume, volume);
                    else
                        volume_open = 0;
                } else {
                    volume_open = volume;
                }
                this.long_position_volume += volume_open;
            } else {
                if (this.volume_limit) {
                    if (this.volume_limit > this.short_position_volume)
                        volume_open = Math.min(this.volume_limit - this.short_position_volume, volume);
                    else
                        volume_open = 0;
                } else {
                    volume_open = volume;
                }
                this.short_position_volume += volume_open;
            }
            if (volume_open > 0) {
                let order_id = RandomStr(this.order_id_prefix);
                pack = {
                    aid: 'insert_order',
                    order_id: order_id,  //必填, 委托单号, 需确保在一个账号中不重复, 限长512字节
                    exchange_id: exchange_id,          //必填, 下单到哪个交易所
                    instrument_id: instrument_id,      //必填, 下单合约代码
                    direction: direction,             //必填, 下单买卖方向
                    offset: "OPEN",               //可选, 下单开平方向, 当指令相关对象不支持开平机制(例如股票)时可不填写此字段
                    volume: volume_open,                    //必填, 下单手数
                    price_type: "LIMIT",          //必填, 报单价格类型
                    limit_price: limit_price,           //当 price_type == LIMIT 时需要填写此字段, 报单价格
                };
                WS.sendJson(pack);
            }
        }
    };
    //重生成函数
    this.func = self[this.ta_class_name](this);
    this.func.next(this.calculateLeft);
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
            if (this.out_series_mark) {
                this.out_series_mark[this.calculateLeft] = null;
            }
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

const ICON_BUY = 1;
const ICON_SELL = 2;

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
