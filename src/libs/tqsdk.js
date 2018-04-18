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
        this.account_id = "";
        this.datas = {};
        this.epoch = 0;
    }

    mergeObject(target, source, deleteNullObj) {
        for (let key in source) {
            let value = source[key];
            switch (typeof value) {
                case 'object':
                    if (value === null) {
                        // 服务器 要求 删除对象
                        if (deleteNullObj) {
                            delete target[key];
                        } else {
                            target[key] = null;
                        }
                    } else if (Array.isArray(value)) {
                        target[key] = target[key] ? target[key] : [];
                        this.mergeObject(target[key], value, deleteNullObj);
                    } else if (key == "data"){
                        //@note: 这里做了一个特例, 使得K线序列数据被保存为一个array, 而非object, 并且记录整个array首个有效记录的id
                        if (!(key in target))
                            target.data = [];
                        if (!target.left_id || Object.keys(value)[0] < target.left_id)
                            target.left_id = Number(Object.keys(value)[0]);
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
        target["_epoch"] = this.epoch;
    }

    is_changing(obj){
        return obj && obj._epoch ? obj._epoch == this.epoch : false;
    }

    get_tdata_obj(insId, instanceId) {
        var path = insId + '.0';
        try {
            return this.datas.ticks[insId].data;
        } catch (e) {
            return undefined;
        }
    }

    clear_data() {
        this.datas = {};
    }

    get_combine(ins_id) {
        return this.get('combines/USER.' + ins_id, from);
    };

    /**
     * 收到aid=="rtn_data"的数据包时, 由本函数处理
     * @param message_rtn_data
     */
    on_rtn_data(message_rtn_data) {
        //收到行情数据包，更新到数据存储区
        this.epoch += 1;
        for (let i = 0; i < message_rtn_data.data.length; i++) {
            let d = message_rtn_data.data[i];
            if (!this.account_id && d.trade){
                this.account_id = Object.keys(d.trade)[0];
            }
            this.mergeObject(this.datas, d, true);
        }
    }

    set_default(default_value, ...path){
        let node = this.datas;
        for (let i = 0; i < path.length; i++) {
            if (! (path[i] in node))
                if (i+1 == path.length)
                    node[path[i]] = default_value;
                else
                    node[path[i]] = {}
            node = node[path[i]];
        }
        return node;
    }

    get(...path){
        let node = this.datas;
        for (let i = 0; i < path.length; i++) {
            if (! (path[i] in node))
                return undefined;
            node = node[path[i]];
        }
        return node;
    }

    make_array_proxy(data_array, item_func=undefined){
        let handler = {
            get: function (target, property, receiver) {
                if (!isNaN(property)) {
                    let i = Number(property);
                    if (i < 0)
                        i = target.length + i;
                    if (item_func)
                        return item_func(data_array[i]);
                    else
                        return data_array[i];
                } else{
                    return target[property];
                }
            }
        };
        let p = new Proxy(data_array, handler);
        return p;
    }
    /**
     * 获取 k线序列
     */
    get_kline_serial(symbol, dur_nano) {
        let ks = this.set_default({last_id: -1, data:[]}, "klines", symbol, dur_nano);
        if (! ks.d){
            ks.d = this.make_array_proxy(ks.data);
            ks.d.open = this.make_array_proxy(ks.data, k => k?k.open:undefined);
            ks.d.high = this.make_array_proxy(ks.data, k => k?k.high:undefined);
            ks.d.low = this.make_array_proxy(ks.data, k => k?k.low:undefined);
            ks.d.close = this.make_array_proxy(ks.data, k => k?k.close:undefined);
            ks.d.volume = this.make_array_proxy(ks.data, k => k?k.volume:undefined);
            ks.d.close_oi = this.make_array_proxy(ks.data, k => k?k.close_oi:undefined);
            ks.d.open_oi = this.make_array_proxy(ks.data, k => k?k.open_oi:undefined);
        }
        return ks;
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
        this.events = {};
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
        // setInterval(this.ontimer, this.intervalTime);
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



class Indicator
{
    constructor(instance_id, symbol, dur_nano, ds, params){
        //技术指标参数, 合约代码/周期也作为参数项放在这里面
        this.instance_id = instance_id;
        this.symbol = symbol;
        this.dur_nano = dur_nano;
        this._ds = ds;   //基础序列, 用作输出序列的X轴
        this.DS = ds.d;  //提供给用户代码使用的ds proxy
        this.PARAMS = params; //指标参数
        this.outs = {}; //输出序列访问函数
        this.out_define = {}; //输出序列格式声明
        this.out_values = {}; //输出序列值
        this.valid_left = -1; //已经计算过的可靠结果范围(含左右两端点), valid_right永远>=valid_left. 如果整个序列没有计算过任何数据, 则 valid_left=valid_right= -1
        this.valid_right = -1;

        this.enable_trade = false;
        this.trade_symbol = symbol;
        this.order_id_prefix = "";
        this.volume_limit = 10;

        this.epoch = 0;
        this.view_left = -1;
        this.view_right = -1;
        this.long_position_volume = 0;
        this.short_position_volume = 0;
        this.is_error = false;
    }

    /**
     * 要求指标实例计算X范围从left到right(包含两端点)的结果值
     * @param left:
     * @param right
     * @return [update_left, update_right]: 本次计算中更新的数据范围, update_right总是>=update_left. 如果本次计算没有任何结果被更新, 返回 [-1, -1]
     */
    calc_range(left=this.view_left, right=this.view_right){
        //无法计算的情形
        if (this.is_error || !this._ds || this._ds.last_id == -1 || left > this._ds.last_id){
            return [-1, -1];
        }
        if(right > this._ds.last_id)
            right = this._ds.last_id;
        //判定是否需要计算及计算范围
        let calc_left = -1;
        let calc_right = -1;
        if (left < this.valid_left || this.valid_left == -1){
            //左端点前移
            calc_left = left;
            calc_right = right;
            if (this._ds.left_id){
                //@todo
            }
            this.valid_left = calc_left;
            this.valid_right = calc_right - 1;
        } else if (right > this.valid_right || left > this.valid_right){
            //向右延伸
            calc_left = this.valid_right + 1;
            calc_right = right;
            this.valid_right = calc_right - 1;
        }
        //重算
        if (calc_right >= calc_left && calc_right != -1){
            for (let i=calc_left; i <= calc_right; i++) {
                this.calc(i);
            }
        }
        return [calc_left, calc_right];
    };

    ORDER(current_i, direction, offset, volume, limit_price = undefined, order_symbol = this.trade_symbol) {
        if (this.is_error || !this._ds || this._ds.last_id == -1)
            return;
        if (!this.out_series_mark) {
            this.out_series_mark = this.OUTS('MARK', 'mk', {});
        }
        this.out_series_mark[current_i] = direction === "BUY" ? ICON_BUY : ICON_SELL;
        if (!this.enable_trade || current_i <= this.last_i || this._ds.last_id != current_i + 1)
            return;
        //@note: 代码跑到这里时, i应该是首次指向序列的倒数第二个柱子
        this.last_i = current_i;
        let quote = TQ.GET_QUOTE(order_symbol);
        if (!limit_price){
            let price_field = direction == "BUY" ? 'ask_price1' : 'bid_price1';
            if (!quote[price_field]) // 取不到对应的价格 包括 NaN 、 undefined
                return;
            limit_price = quote[price_field];
        }
        let volume_open = 0;
        let volume_close = 0;
        if (offset == "CLOSE" || offset == "CLOSEOPEN") {
            if (direction == "BUY") {
                volume_close = Math.min(this.short_position_volume, volume);
                this.short_position_volume -= volume_close;
            } else {
                volume_close = Math.min(this.long_position_volume, volume);
                this.long_position_volume -= volume_close;
            }
            if (volume_close > 0)
                TQ.INSERT_ORDER({
                    symbol: order_symbol,
                    direction: direction,
                    offset: "CLOSE",
                    volume: volume_close,
                    limit_price: limit_price,
                    prefix: this.order_id_prefix,
                });
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
            if (volume_open > 0)
                TQ.INSERT_ORDER({
                    symbol: order_symbol,
                    direction: direction,
                    offset: "OPEN",
                    volume: volume_open,
                    limit_price: limit_price,
                    prefix: this.order_id_prefix,
                });
        }
    };
    OUTS(style, name, options = {}){
        options.style=style;
        this.out_define[name] = options;
        var out_serial = [];
        this.out_values[name] = out_serial;
        let self = this;
        this.outs[name] = function (left, right = null) {
            //每个序列的输出函数允许一次性提取一段数据(含left, right两点)
            //如果提供了left/right 两个参数,则返回一个 array
            //如果只提供left, 则返回一个value
            //无法输出结果的情形
            if (self.is_error || !self._ds || self._ds.last_id == -1){
                if (right == null)
                    return null;
                else
                    return [];
            }
            //负数支持, 如果left/right为负数, 需要先转换到正数, 这一转换又必须事先有一个合约/周期来标定X轴
            if (left < 0)
                left = self._ds.last_id + left + 1;
            if (right < 0)
                right = self._ds.last_id + right + 1;
            //尝试更新计算数据
            let [calc_left, calc_right] = self.calc_range(left, right?right:left);
            //输出数据结果
            if (right == null)
                return out_serial[left];
            else
                return out_serial.slice(left, right);
        };
        return out_serial;
    }
}

class TaManager
{
    constructor(){
        this.class_dict = {};
        this.instance_dict = {};
        this.calc_notify_func = null;
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

    unregister_indicator_class(ind_class_name) {
        delete this.class_dict[ind_class_name];
    };

    new_indicator_instance(ind_class, symbol, dur_nano, ds, params, instance_id) {
        let ind_instance = new ind_class(instance_id, symbol, dur_nano, ds, params);
        this.instance_dict[instance_id] = ind_instance;
        ind_instance.init();
        return ind_instance;
    };

    delete_indicator_instance(ind_instance) {
        delete this.instance_dict[ind_instance.id];
    };

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

        this.GET_COMBINE = this.dm.get_combine;

        this.START_TASK = this.tm.start_task;
        this.PAUSE_TASK = this.tm.pause_task;
        this.RESUME_TASK = this.tm.resume_task;
        this.STOP_TASK = this.tm.stop_task;

        this.ws_processor = {
            onmessage: [],
            onopen: [],
            onreconnect: [],
            onclose: [],
        }
        this.ws.init();
    }

    register_ws_processor(evt, processor_func) {
        this.ws_processor[evt].push(processor_func);
    }

    onmessage(message) {
        switch(message.aid){
            case "rtn_data":
                this.on_rtn_data(message);
            case "update_indicator_instance":
                this.on_update_indicator_instance(message);
            default:
                return;
        }
        for(var f in this.ws_processor.onmessage){
            f(message);
        }
    }
    onopen() {
        this.ws.send_json({
            aid: 'sync_datas',
            sync_datas: {},
        });
        for(var f in this.ws_processor.onopen){
            f();
        }
    }
    onreconnect() {
        for(var f in this.ws_processor.onreconnect){
            f();
        }
    }
    onclose() {
        this.dm.clear_data();
        for(var f in this.ws_processor.onclose){
            f();
        }
    }
    /**
     * 收到aid=="rtn_data"的数据包时, 由本函数处理
     * @param message_rtn_data
     */
    on_rtn_data(message_rtn_data){
        //收到行情数据包，更新到数据存储区
        this.dm.on_rtn_data(message_rtn_data);
        // 重新计算所有技术指标 instance
        for (let id in this.ta.instance_dict) {
            let instance = this.ta.instance_dict[id];
            if (this.dm.is_changing(instance._ds)){
                let [calc_left, calc_right] = instance.calc_range();
                this.send_indicator_data(instance, calc_left, calc_right);
            }
        }

        // this.tm.run();
    }
    on_update_indicator_instance(pack){
        //重置指标参数
        let instance_id = pack.instance_id;
        let instance = null;
        let params = {};
        for (let name in pack.params){
            params[name] = pack.params[name].value;
        }
        let ds = this.dm.get_kline_serial(pack.ins_id, pack.dur_nano);
        let c = this.ta.class_dict[pack.ta_class_name];
        if (!c)
            return;

        if (instance_id in this.ta.instance_dict){
            let instance = this.ta.instance_dict[instance_id];
        }
        if (!this.ta.instance_dict[instance_id]) {
            instance = this.ta.new_indicator_instance(c, pack.ins_id, pack.dur_nano, ds, params, pack.instance_id);
        }else{
            instance = this.ta.instance_dict[pack.instance_id];
            if (ds != instance.ds || params != instance.params){
                this.ta.delete_indicator_instance(instance);
                instance = this.ta.new_indicator_instance(c, pack.ins_id, pack.dur_nano, ds, params, pack.instance_id);
            }
        }
        instance.epoch = pack.epoch;
        instance.view_left = pack.view_left;
        instance.view_right = pack.view_right;

        instance.enable_trade = pack.enable_trade;
        if (pack.trade_symbol)
            instance.trade_symbol = pack.trade_symbol;
        instance.order_id_prefix = pack.order_id_prefix;
        instance.volume_limit = pack.volume_limit;

        let [calc_left, calc_right] = instance.calc_range(pack.view_left, pack.view_right);
        this.send_indicator_data(instance, calc_left, calc_right);
    }
    send_indicator_data(instance, calc_left, calc_right){
        //计算指标值
        let datas = {};
        if(calc_left > -1){
            for (let sn in instance.out_values){
                let s = instance.out_values[sn];
                datas[sn] = [s.slice(calc_left, calc_right + 1)];
            }
        }
        let set_data = {
            "aid": "set_indicator_data",                    //必填, 标示此数据包为技术指标结果数据
            "instance_id": instance.instance_id,                     //必填, 指标实例ID，应当与 update_indicator_instance 中的值一致
            "epoch": instance.epoch,                                  //必填, 指标实例版本号，应当与 update_indicator_instance 中的值一致
            "range_left": calc_left,                             //必填, 表示此数据包中第一个数据对应图表X轴上的位置序号
            "range_right": calc_right,                            //必填, 表示此数据包中最后一个数据对应图表X轴上的位置序号
            "serials": instance.out_define,
            "datas": datas,
        };
        this.ws.send_json(set_data);
    }

    GET_ACCOUNT() {
        return this.dm.get('trade', this.dm.account_id, 'accounts', 'CNY');
    };

    GET_POSITION(symbol) {
        return this.dm.get('trade', this.dm.account_id, 'positions', symbol);
    };

    GET_POSITION_DICT(symbol) {
        return this.dm.get('trade', this.dm.account_id, 'positions');
    }

    GET_QUOTE(symbol){
        // 订阅行情
        var ins_list = this.dm.datas.ins_list;
        if (ins_list && !ins_list.includes(symbol)) {
            var s = ins_list + "," + symbol;
            this.ws.send_json({
                aid: "subscribe_quote",
                ins_list: s,
            });
        }
        return this.dm.set_default({}, 'quotes', symbol);
    }
    GET_KLINE({ kline_id = RandomStr(), symbol=GLOBAL_CONTEXT.symbol, duration=GLOBAL_CONTEXT.duration, width = 100 }={}) {
        if (!symbol || !duration)
            return undefined;
        let dur_nano = duration * 1000000000;
        this.ws.send_json({
            "aid": "set_chart",
            "chart_id": kline_id,
            "ins_list": symbol,
            "duration": dur_nano,
            "view_width": width, // 默认为 100
        });
        let ks = this.dm.get_kline_serial(symbol, dur_nano);
        //这里返回的是实际数据的proxy
        return ks.d;
    }

    /**
     * 提取符合单号符合条件的所有存活委托单
     * @param order_id_prefix: 单号前缀, 单号以此字符串开头的委托单都会在结果集中
     * @returns {*}
     */
    GET_ORDER_DICT(order_id_prefix) {
        let results = {};
        let all_orders = this.dm.set_default({}, 'trade', this.dm.account_id, 'orders');
        for (var ex_or_id in all_orders) {
            var ord = all_orders[ex_or_id];
            if (ord.status == 'ALIVE')
                results[ex_or_id] = ord;
        }
        return results;
    };

    INSERT_ORDER({symbol, direction, offset, volume=1, price_type="LIMIT", limit_price, prefix=""}) {
        if (!this.dm.account_id) {
            Notify.error('未登录，请在软件中登录后重试。');
            return null;
        }
        let {exchange_id, instrument_id} = ParseSymbol(symbol);
        let order_id = prefix + RandomStr(8);
        let send_obj = {
            "aid": "insert_order",
            "order_id": order_id,
            "exchange_id": exchange_id,
            "instrument_id": instrument_id,
            "direction": direction,
            "offset": offset,
            "volume": volume,
            "price_type": "LIMIT",
            "limit_price": limit_price
        };
        this.ws.send_json(send_obj);
        let order = this.dm.set_default({
            order_id: order_id,
            status: "ALIVE",
            volume_orign: volume,
            volume_left: volume,
            exchange_id: exchange_id,
            instrument_id: instrument_id,
            limit_price: limit_price,
            price_type: "LIMIT",
        }, "trade", this.dm.account_id, "orders", order_id);
        return order;
    };

    CANCEL_ORDER(order) {
        let orders = {};
        if (typeof order == 'object') {
            orders[order.order_id] = order;
        }else {
            orders = this.GET_ORDER_DICT(order);
        }
        for (let order_id in orders) {
            this.ws.send_json({
                "aid": "cancel_order",
                "order_id": order_id,
            });
        }
        return Object.keys(orders).length;
    }

    REGISTER_INDICATOR_CLASS(ind_class){
        this.ta.register_indicator_class(ind_class);
        let classDefine = ind_class.define();
        classDefine.aid = 'register_indicator_class';
        classDefine.name = ind_class.name;
        this.ws.send_json(classDefine);
    }
    UNREGISTER_INDICATOR_CLASS(ind_class){
        this.ta.unregister_indicator_class();
    }
    NEW_INDICATOR_INSTANCE(ind_class, symbol, dur_sec, params, instance_id=RandomStr()) {
        let dur_nano = dur_sec * 1000000000;
        let ds = this.dm.get_kline_serial(symbol, dur_nano);
        return this.ta.new_indicator_instance(ind_class, symbol, dur_sec, ds, params, instance_id);
    }
    DELETE_INDICATOR_INSTANCE(ind_instance){
        return this.ta.delete_indicator_instance(ind_instance);
    }
}
