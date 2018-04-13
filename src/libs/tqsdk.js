//utils----------------------------------------------------------------------

/**
 * 返回指定变量的数据类型
 * @param  {Any} data
 * @return {String} Array Object Generator Function String Number Null Undefined Boolean
 */
function type (data){
    return Object.prototype.toString.call(data).slice(8, -1);
}

/**
 * 生成指定长度的随机字符串
 * 默认长度为 8
 */
function RandomStr (len = 8) {
    var charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var s = '';
    for (var i = 0; i < len; i++) s += charts[Math.random() * 0x3e | 0];
    return s;
}

/**
 * 生成序列生成器
 * 默认从 0 开始
 */
function* GenerateSequence(start = 0) {
    while (true) {
        yield start.toString(36);
        start++;
    }
}

/**
 * 解析字符串，读取交易所和交易代码
 */
function ParseSymbol(str) {
    var match_arr = str.match(/([^\.]+)\.(.*)/);
    return {
        exchange_id: match_arr ? match_arr[1] : '',// 交易所代码
        instrument_id: match_arr ? match_arr[2] : ''// 合约代码
    }
}

//dm----------------------------------------------------------------------
class DataManager{
    constructor(){
        this.datas = {};
        this.last_changed_data = {};
        // this.DATA = new Proxy(this.datas, {
        //     get: function (target, key, receiver) {
        //         return Reflect.get(target, key, receiver);
        //     }
        // });
        // this.CHANGING_DATA = new Proxy(this.last_changed_data, {
        //     get: this.function (target, key, receiver) {
        //         return Reflect.get(target, key, receiver);
        //     }
        // });
    }

    mergeObject(target, source, deleteNullObj) {
        for (let key in source) {
            let value = source[key];
            switch (typeof value) {
                case 'object':
                    if (value === null) {
                        // 服务器 要求 删除对象
                        if (deleteNullObj) { delete target[key]; }
                        else { target[key] = null; }
                    } else if (Array.isArray(value)) {
                        target[key] = target[key] ? target[key] : [];
                        this.mergeObject(target[key], value, deleteNullObj);
                    } else {
                        target[key] = target[key] ? target[key] : {};
                        this.mergeObject(target[key], value, deleteNullObj);
                    }
                    break;
                case 'string':
                    if (value === 'NaN') {
                        target[key] = NaN;
                    } else {
                        target[key] = value;
                    }
                    break;
                case 'boolean':
                case 'number':
                    target[key] = value;
                    break;
                case 'undefined':
                    break;
            }
        }
    }

    update_data(diff_list, from = 'server') {
        var diff_object = diff_list;
        if (diff_list instanceof Array) {
            diff_object = diff_list[0];
            for (var i = 1; i < diff_list.length; i++) {
                this.mergeObject(diff_object, diff_list[i], false);
            }
        }
        if (from === 'server') {
            // 只有从服务器更新的数据包，更新 last_changed_data 字段
            for (var k in this.last_changed_data) delete this.last_changed_data[k];
            Object.assign(this.last_changed_data, diff_object);
        }
        this.mergeObject(this.datas, diff_object, true)
    }

    get_tdata_obj(insId, instanceId) {
        var path = insId + '.0';
        G_INSTANCES[instanceId].addRelationship(path);
        try {
            return this.datas.ticks[insId].data;
        } catch (e) {
            return undefined;
        }
    }

    get_kdata_obj(insId, durId) {
        try {
            return this.datas.klines[insId][durId].data;
        } catch (e) {
            return undefined;
        }
    }

    clear_data() {
        // 清空数据
        for (var k in this.datas)
            delete this.datas[k];
    }

    get_account_id() {
        if (this.datas.trade) {
            var keys = Object.keys(this.datas.trade);
            // 只取唯一一个key
            return keys.length > 0 ? keys[0] : undefined;
        }
        return undefined;
    }

    get_data(path, originData = this.datas) {
        try {
            if (typeof path === 'string') {
                var pathList = path.split('/');
                for (var i = 0; i < pathList.length; i++) originData = originData[pathList[i]];
                return originData;
            } else {
                return undefined;
            }
        } catch (e) {
            return undefined;
        }
    }

    get_account(from = this.datas) {
        return this.get_data('trade/' + this.get_account_id() + '/accounts/CNY', from);
    };

    get_position(from = this.datas) {
        return this.get_data('trade/' + this.get_account_id() + '/positions', from);
    };
    get_session(from = this.datas) {
        return this.get_data('trade/' + this.get_account_id() + '/session', from);
    };
    get_order(order_id, from = this.datas) {
        if (type(order_id) == 'String') {
            return this.get_data('trade/' + this.get_account_id() + '/orders/' + order_id, from);
        } else {
            var orders = {};
            var all_orders = this.get_data('trade/' + this.get_account_id() + '/orders', from);
            for (var ex_or_id in all_orders) {
                var ord = all_orders[ex_or_id];
                if (ord.status == 'FINISHED' && ord.volume_orign == ord.volume_left)
                    continue;
                if (ex_or_id in TQ.SELF_ORDERS)
                    orders[ex_or_id] = ord;
            }
            return orders;
        }
    };
    get_combine(ins_id, from = this.datas) {
        return this.get_data('combines/USER.' + ins_id, from);
    };

    /**
     * 收到aid=="rtn_data"的数据包时, 由本函数处理
     * @param message_rtn_data
     */
    on_rtn_data(message_rtn_data) {
        //收到行情数据包，更新到数据存储区
        for (let i = 0; i < message_rtn_data.data.length; i++) {
            this.update_data(message_rtn_data.data[i]);
        }
    }

    /**
     * 获取 k线序列
     */
    get_kline_serial({ kline_id = RandomStr(), symbol=GLOBAL_CONTEXT.symbol, duration=GLOBAL_CONTEXT.duration, width = 100 }={}) {
        if (!symbol || !duration)
            return undefined;
        var dur_nano = duration * 1000000000;
        var that = this;
        return new Proxy({ kline_id, symbol, duration, width }, {
            get: function (target, key, receiver) {
                if (key in target) return target[key];
                var kobj = that.get_data('klines/' + symbol + '/' + dur_nano);
                if (kobj && kobj.data && kobj.last_id) {
                    if (['datetime', 'open', 'high', 'low', 'close', 'volume', 'open_oi', 'close_oi'].includes(key)) {
                        var list = [];
                        for (var i = (kobj.last_id - width + 1); i <= kobj.last_id; i++) {
                            if (kobj.data[i]) list.push(kobj.data[i][key]);
                            else list.push(undefined);
                        }
                        return list;
                    } else if (!isNaN(key)) {
                        if (key < 0) return kobj.data[kobj.last_id + 1 + Number(key)];
                        return kobj.data[kobj.last_id - width + 1 + Number(key)];
                    }
                }
                return undefined;
            }
        });
    }
}

//tm----------------------------------------------------------------------
class Task {
    constructor(task_id, func, waitConditions = null) {
        this.id = task_id;
        this.func = func;
        this.paused = false;
        this.waitConditions = waitConditions;
        // this.timeout = 6000000; // 每个任务默认时间
        // this.endTime = 0;
        this.stopped = false;
        this.events = {}
        this.unit_id = null;
        this.unit_mode = true;
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    stop() {
        this.stopped = true;
    }
}

class TaskManager{
    constructor(){
        this.aliveTasks = {};
        this.intervalTime = 50; // 任务执行循环间隔
        this.runningTask = null;
        this.events = {};
        this.GenTaskId = GenerateSequence();
        setInterval(this.ontimer, this.intervalTime);
    }

    getEndTime(t) {
        return (new Date()).getTime() + t;
    }

    checkTask(task) {
        var status = {};
        task.timeout = undefined;
        for (var cond in task.waitConditions) {
            if (cond.toUpperCase() === 'TIMEOUT') {
                task.timeout = task.waitConditions[cond];
                if ((new Date()).getTime() >= task.endTime) status['TIMEOUT'] = true;
                else status['TIMEOUT'] = false;
                continue;
            }

            try {
                status[cond] = task.waitConditions[cond]();
            } catch (err) {
                console.log(err)
                status[cond] = false;
            }
        }
        return status;
    }

    runTask(task) {
        TaskManager.runningTask = task;
        var waitResult = checkTask(task);
        /**
         * ret: { value, done }
         */
        for (var r in waitResult) {
            if (waitResult[r] === true) {
                // waitConditions 中某个条件为真才执行 next
                var ret = task.func.next(waitResult);
                if (ret.done) {
                    task.stopped = true;
                    task.return = ret.value;
                    TaskManager.any_task_stopped = true;
                } else {
                    if (task.timeout) task.endTime = getEndTime(task.timeout);
                    task.waitConditions = ret.value;
                }
                break;
            }
        }
    }

    run(obj) {
        if (obj) {
            if (!(obj.type in TaskManager.events)) TaskManager.events[obj.type] = {};
            if (!(obj.id in TaskManager.events[obj.type])) TaskManager.events[obj.type][obj.id] = obj.data;
        }
        TaskManager.any_task_stopped = false; // 任何一个task 的状态改变，都重新 run
        for (var taskId in aliveTasks) {
            if (aliveTasks[taskId].paused || aliveTasks[taskId].stopped) continue;
            try {
                runTask(aliveTasks[taskId]);
            } catch (err) {
                if (err == 'not logined') Notify.error('未登录，请在软件中登录后重试。');
                else console.log(err)
            }
        }
        if (obj) {
            delete TaskManager.events[obj.type][obj.id];
        }
        if (TaskManager.any_task_stopped) TaskManager.run();
    }

    ontimer() {
        for (var taskId in aliveTasks) {
            var task = aliveTasks[taskId];
            // 用户显示定义了 timeout 才记录 timeout 字段
            if (task.timeout) {
                if (task.paused) {
                    task.endTime += intervalTime;
                } else {
                    var now = (new Date()).getTime();
                    if (task.endTime <= now) runTask(task);
                }
            }
        }
    }

    add(func) {
        var task_id = GenTaskId.next().value;
        var task = new Task(task_id, func);
        aliveTasks[task_id] = task;
        TaskManager.runningTask = task;
        var ret = task.func.next();
        if (ret.done) {
            task.stopped = true;
            task.return = ret.value;
        } else {
            for (var cond in ret.value) {
                if (cond.toUpperCase() === 'TIMEOUT') {
                    task.timeout = ret.value[cond];
                    task.endTime = getEndTime(task.timeout);
                    break;
                }
            }
            task.waitConditions = ret.value;
        }
        return task;
    }

    remove(task) {
        delete aliveTasks[task.id];
    }

    start_task(func){
        if (typeof func === 'function') {

            var args = [];
            if (arguments.length > 1) {
                var len = 1;
                while (len < arguments.length)
                    args.push(arguments[len++]);
            }
            var f = func.apply(null, args);
            if (f.next && (typeof f.next === 'function')) {
                return TaskManager.add(f);
            } else {
                console.log('task 参数类型错误');
            }
        } else {
            console.log('task 参数类型错误');
        }
    }

    stop_task(task){
        if (task)
            task.stop();
        return null;
    }

    pause_task(task){
        task.pause();
    }

    resume_task(task){
        task.resume();
    }
}

//ta----------------------------------------------------------------------
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

class Indicator
{
    OUTS(){

    }
    constructor(){
        this.symbol = "";
        this.dur_nano = 0;
        this.view_left = -1;
        this.view_right = -1;
        this.invalid = false;
        this.is_error = false;
    }

    reset(params){
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
    }

    updateRange() {
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

    exec() {
        if (this.is_error)
            return;
        this.updateRange();
        if (this.BEGIN === -1)
            return;

        //执行计算calculateRight
        var [left, right] = [this.calculateLeft, this.calculateRight];
        for (; this.calculateLeft <= this.calculateRight; this.calculateLeft++) {
            if (this.out_series_mark) {
                this.out_series_mark[this.calculateLeft] = null;
            }
            this.func.next(this.calculateLeft);
        }
        this.calculateLeft--;

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
}

class TaManager
{
    constructor(){
        this.class_dict = {};
        this.instance_dict = {};
        this.calc_notify_func = null;
    }
    add(instance_id, ind_instance){
        this.instance_dict[instance_id] = ind_instance;
    }
    delete(instance_id) {
        delete this.instance_dict[instance_id];
    }
    on_rtn_data(message){
        // 标记需要重算的 instance
        var invalid_instance_list = [];
        for (let i = 0; i < message.data.length; i++) {
            var klines = message.data[i].klines;
            if (klines)
                for (let key in klines) {
                    for (let dur in klines[key]) {
                        let perfix = key + '.' + dur;
                        for (let id in this.instance_dict) {
                            invalid_instance_list.insert(id);
                        }
                    }
                }
        }
        // 重新计算 instance
        for (let id in invalid_instance_list) {
            this.calculate(this.instance_dict[id]);
        }
    }
    calculate(instance){
        let runId = Keys.next().value;
        start_msg = {
            cmd: 'calc_start',
            content: {
                id: runId,
                className: instance.ta_class_name,
            },
        };
        if (this.calc_notify_func)
            this.calc_notify_func(start_msg);
        try {
            instance.exec();
            end_msg = {
                cmd: 'calc_end',
                content: {
                    id: runId,
                    className: instance.ta_class_name,
                },
            };
        } catch (e) {
            console.error(e);
            end_msg = {
                cmd: 'feedback',
                content: {
                    error: true,
                    type: 'run',
                    message: e.message,
                    func_name: instance.ta_class_name,
                },
            };
        };
        if (this.calc_notify_func)
            this.calc_notify_func(end_msg);
    }

    register_indicator_class(ind_class){
        this.class_dict[ind_class.name] = ind_class;
    };

    unregister_indicator_class(ind_class) {
        //todo:
    };

    new_indicator_instance(ind_class, params) {
        let ind_instance = new ind_class(params);
        ind_instance.reset(params);
        this.add(ind_instance);
        return ind_instance;
    };

    update_indicator_instance(ind_instance, params) {
        ind_instance.reset(params);
    };

    delete_indicator_instance(ind_instance, params) {
        this.ta_manager.delete(ind_instance.id);
    };

    on_update_indicator_instance(pack){
        if (!this.instance_dict[pack.instance_id]) {
            var c = this.class_dict[pack.ind_class_name];
            this.new_indicator_instance(c, pack.params);
        }
        this.instance_dict[pack.instance_id].reset(pack.params);
    }
}

//ws----------------------------------------------------------------------
class TqWebsocket{
    constructor(url, callbacks){
        this.url = url;
        this.ws = null;
        this.queue = [];

        // 自动重连开关
        this.reconnect = true;
        this.reconnectTask = null;
        this.reconnectInterval = 3000;
        this.callbacks = callbacks;

        this.STATUS = {
            CONNECTING: 0,
            OPEN: 1,
            CLOSING: 2,
            CLOSED: 3,
        };
    }

    send_json(obj) {
        function jsonToStr(obj) {
            return JSON.stringify(obj);
        }
        if (this.ws.readyState === 1) {
            this.ws.send(jsonToStr(obj));
        } else {
            this.queue.push(jsonToStr(obj));
        }
    };

    isReady() {
        return this.ws.readyState === 1;
    };

    init() {
        function strToJson(message) {
            return eval('(' + message + ')');
        }

        this.ws = new WebSocket(this.url);
        var _this = this;
        this.ws.onmessage = function (message) {
            _this.callbacks.onmessage(strToJson(message.data));
        };

        this.ws.onclose = function (event) {
            // 清空 datamanager
            _this.callbacks.onclose();

            // 清空 queue
            _this.queue = [];

            // 自动重连
            if (_this.reconnect) {
                _this.reconnectTask = setInterval(function () {
                    if (_this.ws.readyState === 3) _this.init();
                }, _this.reconnectInterval);
            }
        };

        this.ws.onerror = function (error) {
            _this.ws.close();
        };

        this.ws.onopen = function () {
            // 请求全部数据同步
            _this.callbacks.onopen();
            if (this.reconnectTask) {
                clearInterval(_this.reconnectTask);
                _this.callbacks.onreconnect();
            }

            if (_this.queue.length > 0) {
                while (_this.queue.length > 0) {
                    if (_this.ws.readyState === 1) _this.ws.send(_this.queue.shift());
                    else break;
                }
            }
        };
    };
}

//sdk----------------------------------------------------------------------

GLOBAL_CONTEXT = {
    current_symbol: "SHFE.cu1801",
    current_dur: "5000000000",
};

class TQSDK {
    constructor(mock_ws) {
        if(mock_ws){
            this.ws = mock_ws;
        } else {
            this.ws = new TqWebsocket('ws://127.0.0.1:7777/', this);
        }
        this.dm = new DataManager();
        this.tm = new TaskManager();
        this.ta = new TaManager();

        this.GET_ACCOUNT = this.dm.get_account;
        this.GET_ORDER = this.dm.get_order;
        this.GET_COMBINE = this.dm.get_combine;
        this.GET_POSITION = this.dm.get_position;

        this.START_TASK = this.tm.start_task;
        this.PAUSE_TASK = this.tm.pause_task;
        this.RESUME_TASK = this.tm.resume_task;
        this.STOP_TASK = this.tm.stop_task;

        this.UNREGISTER_INDICATOR_CLASS = this.ta.unregister_indicator_class;
        this.NEW_INDICATOR_INSTANCE = this.ta.new_indicator_instance;
        this.UPDATE_INDICATOR_INSTANCE = this.ta.update_indicator_instance;
        this.DELETE_INDICATOR_INSTANCE = this.ta.delete_indicator_instance;

        this.message_processor = {
            "rtn_data": this.on_rtn_data,
        }

        this.ws.init();
    }
    onmessage(message) {
        processor = this.message_processor(message.aid);
        if(processor)
            processor(message);
    }
    onopen() {
    }
    onreconnect() {
    }
    onclose() {
    }
    register_processor(aid, processor_func) {
        this.message_processor[aid] = processor_func;
    }

    REGISTER_INDICATOR_CLASS(ind_class){
        this.ta.register_indicator_class(ind_class);
        let classDefine = ind_class.define();
        classDefine.aid = 'register_indicator_class';
        classDefine.name = ind_class.name;
        this.ws.sendJson(classDefine);
    }

    /**
     * 收到aid=="rtn_data"的数据包时, 由本函数处理
     * @param message_rtn_data
     */
    on_rtn_data(message_rtn_data){
        //收到行情数据包，更新到数据存储区
        this.dm.on_rtn_data(message_rtn_data);
        this.ta.on_rtn_data(message_rtn_data);
        this.tm.run();
    }
    GET_QUOTE(symbol){
        // 订阅行情
        var ins_list = this.dm.datas.ins_list;
        if (ins_list && !ins_list.includes(symbol)) {
            var s = ins_list + "," + symbol;
            this.ws.sendJson({
                aid: "subscribe_quote",
                ins_list: s,
            });
        }
        return this.dm.get_data('quotes/' + symbol);
    }
    GET_KLINE({ kline_id = RandomStr(), symbol=GLOBAL_CONTEXT.symbol, duration=GLOBAL_CONTEXT.duration, width = 100 }={}) {
        if (!symbol || !duration)
            return undefined;
        var dur_nano = duration * 1000000000;
        this.ws.send_json({
            "aid": "set_chart",
            "chart_id": kline_id,
            "ins_list": symbol,
            "duration": dur_nano,
            "view_width": width, // 默认为 100
        });
        return this.dm.get_kline_serial({kline_id, symbol, duration, width});
    }
    INSERT_ORDER(ord) {
        if (!this.dm.get_account_id()) {
            Notify.error('未登录，请在软件中登录后重试。');
            return false;
        }
        var order_id = ord.order_id ? ord.order_id : TQ.ORDER_ID_PREFIX + GenOrderId.next().value;
        var send_obj = {
            "aid": "insert_order",
            "order_id": order_id,
            "exchange_id": ord.exchange_id,
            "instrument_id": ord.instrument_id,
            "direction": ord.direction,
            "offset": ord.offset,
            "volume": ord.volume,
            "price_type": "LIMIT",
            "limit_price": ord.limit_price
        };
        this.ws.sendJson(send_obj);

        if (!TQ.GET_ORDER(order_id)) {
            var orders = {};
            orders[order_id] = {
                order_id: order_id,
                status: "UNDEFINED",
                volume_orign: ord.volume,
                volume_left: ord.volume,
                exchange_id: ord.exchange_id,
                instrument_id: ord.instrument_id,
                limit_price: ord.limit_price,
                price_type: "LIMIT",
            };
            this.dm.update_data({
                "trade": {
                    [this.dm.get_account_id()]: {
                        "orders": orders
                    }
                }
            }, 'local');
        }
        order = TQ.GET_ORDER(order_id);
        TQ.SELF_ORDERS[order_id] = order;
        return order;
    };

    CANCEL_ORDER(order) {
        if (order && order.exchange_order_id) {
            this.ws.sendJson({
                "aid": "cancel_order",
                "order_id": order.order_id,
            });
        } else if (TaskManager.runningTask.unit_mode) {
            var orders = TQ.GET_ORDER();
            for (var order in orders) {
                if (orders[order].status == 'ALIVE' || orders[order].status == "UNDEFINED")
                    this.ws.sendJson({
                        "aid": "cancel_order",
                        "order_id": orders[order].order_id,
                    });
            }
        }
    };
}


// if (typeof exports !== 'undefined') {
//     module.exports = {TQSDK, Indicator};
//     // exports.DataManager = DataManager;
// } else {
//     var TQ = new TQSDK();
// }

var assert = require('assert');
// var {TQSDK, Indicator} = require('../src/libs/tqsdk.js');

class MockWebsocket{
    constructor(url, callbacks){
    }
    send_json(obj) {
    };
    isReady() {
        return true;
    };
    init() {
    };
}

var TQ = new TQSDK(new MockWebsocket());

describe('dm', function () {
    TQ.dm.on_rtn_data({
        "aid": "rtn_data",                                        //数据推送
        "data": [                                                 //diff数据数组, 一次推送中可能含有多个数据包
            {
                "quotes": {                                           //实时行情数据
                    "SHFE.cu1612": {
                        "instrument_id": "cu1612",                        //合约代码
                        "datetime": "2016-12-30 13:21:32.500000",         //时间
                        "ask_price1": 36590.0,                            //卖价
                        "ask_volume1": 121,                               //卖量
                        "bid_price1": 36580.0,                            //买价
                        "bid_volume1": 3,                                 //买量
                        "last_price": 36580.0,                            //最新价
                        "highest": 36580.0,                               //最高价
                        "lowest": 36580.0,                                //最低价
                        "amount": 213445312.5,                            //成交额
                        "volume": 23344,                                  //成交量
                        "open_interest": 23344,                           //持仓量
                        "pre_open_interest": 23344,                       //昨持
                        "pre_close": 36170.0,                             //昨收
                        "open": 36270.0,                                  //今开
                        "close": 36270.0,                                 //收盘
                        "lower_limit": 34160.0,                           //跌停
                        "upper_limit": 38530.0,                           //涨停
                        "average": 36270.1,                               //均价
                        "pre_settlement": 36270.0,                        //昨结
                        "settlement": 36270.0,                            //结算价
                    },
                },
                "klines": {                                           //K线数据
                    "SHFE.cu1601": {                                         //合约代码
                        180000000000: {                                   //K线周期, 单位为纳秒, 180000000000纳秒 = 3分钟
                            "last_id": 3435,                                //整个序列最后一个记录的序号
                            "data": {
                                3435: {
                                    "datetime": 192837400000000,                //UnixNano 北京时间，如果是日线，则是交易日的 UnixNano
                                    "open": 3432.33,                            //开
                                    "high": 3432.33,                            //高
                                    "low": 3432.33,                             //低
                                    "close": 3432.33,                           //收
                                    "volume": 2,                                //成交量
                                    "open_oi": 1632,                            //起始持仓量
                                    "close_oi": 1621,                           //结束持仓量
                                },
                            },
                            "binding": {
                                "cu1709": {
                                    3384: 2900,                                 //本合约K线所对应的另一个合约的K线号
                                    3385: 2950,
                                }
                            }
                        },
                    },
                },
                "ticks": {
                    "cu1601": {
                        "last_id": 3550,                                  //整个序列最后一个元素的编号
                        "data": {
                            3384: {
                                "datetime": 1928374000000000,                 //UnixNano 北京时间
                                "trading_day": 1928374000000000,              //交易日的UnixNano 北京时间
                                "last_price": 3432.33,                        //最新价
                                "highest": 3452.33,                           //最高价
                                "lowest": 3402.33,                            //最低价
                                "bid_price1": 3432.2,                         //买一价
                                "ask_price1": 3432.4,                         //卖一价
                                "bid_volume1": 1,                             //买一量
                                "ask_volume1": 2,                             //卖一量
                                "volume": 200,                                //成交量
                                "open_interest": 1621,                        //持仓量
                            },
                        }
                    },
                },
                "notify": {                                           //通知信息
                    "2010": {
                        "type": "MESSAGE",                                //MESSAGE TEXT
                        "code": 1000,
                        "content": "abcd",
                    }
                },
                "trade": {                                            //交易相关数据
                    "user1": {                                          //登录用户名
                        "user_id": "user1",                               //登录用户名
                        "accounts": {                                     //账户资金信息
                            "CNY": {                                        //account_key, 通常为币种代码
                                //核心字段
                                "account_id": "423423",                       //账号
                                "currency": "CNY",                            //币种
                                "balance": 9963216.550000003,                 //账户权益
                                "available": 9480176.150000002,               //可用资金
                                                                              //参考字段
                                "pre_balance": 12345,                         //上一交易日结算时的账户权益
                                "deposit": 42344,                             //本交易日内的入金金额
                                "withdraw": 42344,                            //本交易日内的出金金额
                                "commission": 123,                            //本交易日内交纳的手续费
                                "preminum": 123,                              //本交易日内交纳的权利金
                                "static_balance": 124895,                     //静态权益
                                "position_profit": 12345,                     //持仓盈亏
                                "float_profit": 8910.231,                     //浮动盈亏
                                "risk_ratio": 0.048482375,                    //风险度
                                "margin": 11232.23,                           //占用资金
                                "frozen_margin": 12345,                       //冻结保证金
                                "frozen_commission": 123,                     //冻结手续费
                                "frozen_premium": 123,                        //冻结权利金
                                "close_profit": 12345,                        //本交易日内平仓盈亏
                                "position_profit": 12345,                     //当前持仓盈亏
                            }
                        },
                        "positions": {                                    //持仓
                            "SHFE.cu1801": {                                //合约代码
                                "exchange_id": "SHFE",                        //交易所
                                "instrument_id": "cu1801",                    //交易所内的合约代码
                                "volume_long": 5,                             //多头持仓手数
                                "volume_short": 5,                            //空头持仓手数
                                "hedge_flag": "SPEC",                         //套保标记
                                "open_price_long": 3203.5,                    //多头开仓均价
                                "open_price_short": 3100.5,                   //空头开仓均价
                                "open_cost_long": 3203.5,                     //多头开仓市值
                                "open_cost_short": 3100.5,                    //空头开仓市值
                                "margin": 32324.4,                            //占用保证金
                                "float_profit_long": 32324.4,                 //多头浮动盈亏
                                "float_profit_short": 32324.4,                //空头浮动盈亏
                                "volume_long_today": 5,                       //多头今仓手数
                                "volume_long_his": 5,                         //多头老仓手数
                                "volume_long_frozen": 5,                      //多头持仓冻结
                                "volume_long_frozen_today": 5,                //多头今仓冻结
                                "volume_short_today": 5,                      //空头今仓手数
                                "volume_short_his": 5,                        //空头老仓手数
                                "volume_short_frozen": 5,                     //空头持仓冻结
                                "volume_short_frozen_today": 5,               //空头今仓冻结
                            }
                        },
                        "orders": {                                       //委托单
                            "abc|123": {                                    //order_key, 用于唯一标识一个委托单
                                "order_id": "123",                            //委托单ID, 对于一个用户的所有委托单，这个ID都是不重复的
                                "exchange_id": "SHFE",                        //交易所
                                "instrument_id": "cu1801",                    //合约代码
                                "direction": "BUY",                           //下单方向
                                "offset": "OPEN",                             //开平标志
                                "volume_orign": 6,                            //总报单手数
                                "volume_left": 3,                             //未成交手数
                                "price_type": "LIMIT",                        //价格类型
                                "limit_price": 45000,                         //委托价格, 仅当 price_type = LIMIT 时有效
                                "status": "ALIVE",                            //委托单状态, ALIVE=有效, FINISHED=已完
                                "insert_date_time": 1928374000000000,         //下单时间
                                "exchange_order_id": "434214",                //交易所单号
                            }
                        },
                        "trades": {                                       //成交记录
                            "abc|123|1": {                                  //trade_key, 用于唯一标识一个成交项
                                "order_id": "123",
                                "exchange_id": "SHFE",                        //交易所
                                "instrument_id": "cu1801",                    //交易所内的合约代码
                                "exchange_trade_id": "1243",                  //交易所成交号
                                "direction": "BUY",                           //成交方向
                                "offset": "OPEN",                             //开平标志
                                "volume": 6,                                  //成交手数
                                "price": 1234.5,                              //成交价格
                                "trade_date_time": 1928374000000000           //成交时间
                            }
                        },
                    },
                }
            }
        ]
    });
    it('GetQuote with symbol', function () {
        var q = TQ.GET_QUOTE("SHFE.cu1612");
        assert.equal(q.last_price, 36580.0);
    });
    it('GET_KLINE with all params', function () {
        var q = TQ.GET_KLINE({
            symbol: "SHFE.cu1601",
            duration: 180,
        });
        assert.equal(q[-1].close, 3432.33);
        // assert.equal(q.close[-1], 3432.33);
    });
    it('2', function () {
        // assert(n == 2);
        // n += 1;
        // assert(Object.keys(dm.datas).length == 0);
        // expect(4 + 5).to.be.equal(9);
        // assert.equal(dm.datas, {});
    });
});


class kdj extends Indicator
{
    static define() {
        return {
            type: "SUB",
            cname: "KDJ",
            state: "KLINE",
            params: [
                {name: "N", default:3},
                {name: "M1", default:5},
                {name: "M2", default:5},
            ],
        }
    }
    constructor(){
        super();
        //输入序列
        this.ks = TQ.GET_KLINE();
        this.k = this.OUTS("LINE", "k", {color: RED});
        this.d = this.OUTS("LINE", "d", {color: GREEN});
        this.j = this.OUTS("LINE", "j", {color: YELLOW});
        this.rsv = [];
    }
    calc(i) {
        let hv = HIGHEST(i, this.ks.high, this.params.n);
        let lv = LOWEST(i, this.ks.low, this.params.n);
        rsv[i] = (hv == lv) ? 0 : (this.ks.close[i] - lv) / (hv - lv) * 100;
        this.k[i] = SMA(i, rsv, m1, 1, k);
        this.d[i] = SMA(i, k, m2, 1, d);
        this.j[i] = 3*k[i] - 2*d[i];
    }
}

describe('ta', function () {
    TQ.ta.register_indicator_class(kdj);
    it('New indicator instance', function () {
        let ind = TQ.NEW_INDICATOR_INSTANCE(kdj, {});
    });
});

// //------------------------------------------------------------------------------
// //预期用法
//
// //在普通的html中,
// <script type="text/javascript" src="lib/tqsdk.js"></script>
// TQ.GET_KLINE(...);
// ind = TQ.NEW_INDICATOR_INSTANCE(...);
//
//
// //在ta-ide中,
// worker.js
// TQ.register_processor('update_indicator_instance', TQ.ta.update_indicator_instance);
// TQ.register_processor('delete_indicator_instance', TQ.ta.delete_indicator_instance);
//

//     ORDER_ID_PREFIX = this."EXT." + RandomId + ".",
//     SELF_ORDERS = this.{},
//     SET_ORDER_ID_PREFIX(order_id_prefix){
//       TQ.ORDER_ID_PREFIX = order_id_prefix + "." + RandomId + ".";
//     },
// };
//
//
