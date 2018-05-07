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

/**
 * 深度比较两个对象是否相同
 * @param x
 * @param y
 * @returns {boolean}
 */
Object.equals = function(x, y){
    if (!(x instanceof Object && y instanceof Object)){
        return x == y;
    }
    for (let p in y) {
        if (!x.hasOwnProperty(p)) return false;
    }
    for (let p in x) {
        if (!y.hasOwnProperty(p)) return false;
        if (typeof y[p] != typeof x[p]) return false;
        if (!Object.equals(x[p], y[p])) return false;
    }
    return true;
}

/**
 * 返回array的一个proxy，以支持负数下标，并可选的为每个数据项提供一个读取转换函数
 * @param data_array
 * @param item_func
 * @returns {Proxy}
 */
function make_array_proxy(data_array, item_func=undefined){
    let handler = {
        get: function (target, property, receiver) {
            if (!isNaN(property)) {
                let i = Number(property);
                if (i < 0)
                    return NaN;
                    // i = target.length + i;
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
                    node[path[i]] = {};
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

    /**
     * 获取 k线序列
     */
    get_kline_serial(symbol, dur_nano) {
        let ks = this.set_default({last_id: -1, data:[]}, "klines", symbol, dur_nano);
        if (! ks.d){
            ks.d = make_array_proxy(ks.data);
            ks.d.open = make_array_proxy(ks.data, k => k?k.open:undefined);
            ks.d.high = make_array_proxy(ks.data, k => k?k.high:undefined);
            ks.d.low = make_array_proxy(ks.data, k => k?k.low:undefined);
            ks.d.close = make_array_proxy(ks.data, k => k?k.close:undefined);
            ks.d.volume = make_array_proxy(ks.data, k => k?k.volume:undefined);
            ks.d.close_oi = make_array_proxy(ks.data, k => k?k.close_oi:undefined);
            ks.d.open_oi = make_array_proxy(ks.data, k => k?k.open_oi:undefined);
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
        this.runningTask = null; // 正在执行的 Task
        this.events = {};
        this.GenTaskId = GenerateSequence();
        this.interval = setInterval(function(){
            for (var taskId in this.aliveTasks) {
                var task = this.aliveTasks[taskId];
                // 用户显示定义了 timeout 才记录 timeout 字段
                if (task.timeout) {
                    if (task.paused) {
                        task.endTime += this.intervalTime;
                    } else {
                        var now = (new Date()).getTime();
                        if (task.endTime <= now)
                            this.runTask(task);
                    }
                }
            }
        }, this.intervalTime);
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
        this.runningTask = task;
        var waitResult = this.checkTask(task);
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
                    this.any_task_stopped = true;
                } else {
                    if (task.timeout) task.endTime = this.getEndTime(task.timeout);
                    task.waitConditions = ret.value;
                }
                break;
            }
        }
    }

    run(obj) {
        if (obj) {
            if (!(obj.type in this.events)) this.events[obj.type] = {};
            if (!(obj.id in this.events[obj.type])) this.events[obj.type][obj.id] = obj.data;
        }
        this.any_task_stopped = false; // 任何一个task 的状态改变，都重新 run
        for (var taskId in this.aliveTasks) {
            if (this.aliveTasks[taskId].paused || this.aliveTasks[taskId].stopped)
                continue;
            try {
                this.runTask(this.aliveTasks[taskId]);
            } catch (err) {
                if (err == 'not logined')
                    Notify.error('未登录，请在软件中登录后重试。');
                else
                    console.log(err)
            }
        }
        if (obj) {
            delete this.events[obj.type][obj.id];
        }
        if (this.any_task_stopped)
            this.run();
    }

    add(func) {
        var task_id = this.GenTaskId.next().value;
        var task = new Task(task_id, func);
        this.aliveTasks[task_id] = task;
        this.runningTask = task;
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
        delete this.aliveTasks[task.id];
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
                return this.add(f);
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
const ICON_BLOCK = 3;
const IS_TEST = typeof global != 'undefined';
const IS_WOEKER = IS_TEST ? false : typeof self.$ == 'undefined';

class IndicatorDefineContext {
    constructor(ind_func) {
        this.instance = ind_func(this);
        let indicatorName = ind_func.name;
        this.define = {
            aid: 'register_indicator_class',
            name: indicatorName,
            cname: indicatorName,
            type: 'SUB',
            state: 'KLINE',
            yaxis: [{ id: 0 }],
            params: [],
        };
        this.params = new Map();
    }

    DEFINE(options) {
        if (!(options === undefined)) {
            Object.assign(this.define, options);
        }
    };

    PARAM(paramDefaultValue, paramName, options) {
        let paramDefine = this.params.get(paramName);
        if (paramDefine === undefined) {
            paramDefine = {
                name: paramName,
                default: paramDefaultValue,
            };
            if (typeof paramDefaultValue === 'string') {
                paramDefine.type = 'STRING';
            } else if (typeof paramDefaultValue === 'number') {
                paramDefine.type = 'NUMBER';
            } else if (paramDefaultValue instanceof COLOR) {
                paramDefine.type = 'COLOR';
            }

            if (options !== undefined) {
                Object.assign(paramDefine, options);
            }
            this.params.set(paramName, paramDefine);
        }
        return paramDefaultValue;
    };
    OUTS() {
    };
    ORDER() {
    };
    TRADE_AT_CLOSE(){
    };
    TRADE_OC_CYCLE(){
    };
    get_define() {
        this.instance.next();
        this.params.forEach((value) => this.define.params.push(value));
        return this.define;
    }
}

class IndicatorRunContext {
    constructor(ind_func, instance_id, symbol, dur_nano, ds, tq){
        //技术指标参数, 合约代码/周期也作为参数项放在这里面
        this.ind = ind_func(this);
        this.TQ = tq;
        this.ind_class_name = ind_func.name;
        this.instance_id = instance_id;
        this.symbol = symbol;
        this.dur_nano = dur_nano;
        this._ds = ds;   //基础序列, 用作输出序列的X轴
        this.DS = ds.d;  //提供给用户代码使用的ds proxy
        this.PARAMS = {}; //指标参数
        this.outs = {}; //输出序列访问函数
        this.out_define = {}; //输出序列格式声明
        this.out_values = {}; //输出序列值
        this.out_drawings = {};
        this.valid_left = -1; //已经计算过的可靠结果范围(含左右两端点), valid_right永远>=valid_left. 如果整个序列没有计算过任何数据, 则 valid_left=valid_right= -1
        this.valid_right = -1;

        this.enable_trade = false;
        this.trade_symbol = symbol;
        this.unit_id = "TA." + this.instance_id;
        this.volume_limit = 10;

        this.epoch = 0;
        this.view_left = -1;
        this.view_right = -1;
        this.is_error = false;
        this.trade_at_close = false;
        this.trade_oc_cycle = false;
    }
    init(){
        this.ind.next();
    }
    DEFINE(){
    }

    PARAM(defaultValue, name){
        if (!(name in this.PARAMS))
            this.PARAMS[name] = defaultValue;
        return this.PARAMS[name];
    }

    DRAW(id, params){
        this.out_drawings[id] = params;
    }
    DRAW_LINE(id, x1, y1, x2, y2, color=0xFFFFFF, width=1, style=0){
        this.out_drawings[id] = {type:"LINE", x1, y1, x2, y2, color, width, style};
    };
    DRAW_RAY(id, x1, y1, x2, y2, color=0xFFFFFF, width=1, style=0){
        this.out_drawings[id] = {type:"RAY", x1, y1, x2, y2, color, width, style};
    };
    DRAW_SEG(id, x1, y1, x2, y2, color=0xFFFFFF, width=1, style=0){
        this.out_drawings[id] = {type:"SEG", x1, y1, x2, y2, color, width, style};
    };
    DRAW_BOX(id, x1, y1, x2, y2, color=0xFFFFFF, width=1, style=0){
        this.out_drawings[id] = {type:"BOX", x1, y1, x2, y2, color, width, style};
    };
    DRAW_PANEL(id, x1, y1, x2, y2, color=0xFFFFFF){
        this.out_drawings[id] = {type:"PANEL", x1, y1, x2, y2, color};
    };
    DRAW_ICON(id, x1, y1, icon){
        this.out_drawings[id] = {type:"ICON", x1, y1, icon};
    };
    DRAW_TEXT(id, x1, y1, text="", color=0xFFFFFF){
        this.out_drawings[id] = {type:"TEXT", x1, y1, text, color};
    };

    /**
     * 某个范围内有效数据
     * @param left
     * @param right
     * @returns 返回存在数据的最后一个 id, 如果不存在 返回的数字比 left 小
     */
    _exist_data_range(left, right, dataArr=this._ds.d){
        if (left > right)
            return left - 1;
        for(let i = left; i<=right && !dataArr[i]; i++){
            right = i-1;
            break;
        }
        return right;
    }

    /**
     * 要求指标实例计算X范围从left到right(包含两端点)的结果值
     * @param left:
     * @param right
     * @return [update_left, update_right]: 本次计算中更新的数据范围, update_right总是>=update_left. 如果本次计算没有任何结果被更新, 返回 [-1, -1]
     */
    calc_range(left, right){
        // 无法计算的情形
        if (this.is_error || !this._ds || this._ds.last_id == -1 || left > this._ds.last_id){
            return [-1, -1];
        }


        let calc_left = -1, calc_right = -1;
        let isDefault = false;

        if (left == undefined || right == undefined) {
            // 1 默认值  => 没有数据就不计算
            left = this.view_left < this._ds.left_id ? this._ds.left_id : this.view_left;
            right = this.view_right > this._ds.last_id ? this._ds.last_id : this.view_right;
            if(right < left) return [-1, -1];
            isDefault = true;

        } else {
            // 2 用户输入值 => 即使没有数据也要计算填入 NaN, 把用户输入的范围记下来
            [calc_left, calc_right] = [left, right];
        }

        /**
         * ------[-----------------]------- this._ds.d
         *   valid_left        valid_right
         */
        if(this.valid_left == -1 || this.valid_right == -1 || right < this.valid_left || left > this.valid_right ){
            // -------------------------------
            // --(***)--[----------------]----
            // ----[----------------]--(***)--
            right = this._exist_data_range(left, right);
            if (right >= left) {
                this.valid_left = left;
                this.valid_right = right;
            } else {
                if(isDefault) return [-1, -1];
            }
        } else if(left < this.valid_left){
            // 向前移动
            // --(***[**************]***)--
            // --(***[****)---------]------
            let temp_right = this._exist_data_range(left, this.valid_left);
            if(temp_right >= left){
                if (temp_right < this.valid_left) {
                    // this.valid_left 之前有不存在的数据
                    this.valid_right = right = temp_right;
                } else if (right > this.valid_right) {
                    // --(***[**************]***)--
                    right = this._exist_data_range(this.valid_right, right);
                    this.valid_right = right;
                } else {
                    // --(***[****)---------]------
                    calc_right = right = this.valid_left;
                }
                this.valid_left = left;
            } else {
                if(isDefault) return [-1, -1];
            }
        } else {
            // 向后移动
            if (right < this.valid_right ){
                // --[---(*******)-----]-----
                return [-1, -1];
            } else {
                // --[---(************]***)--
                calc_left = left = this.valid_right;
                right = this._exist_data_range(this.valid_right, right);
                this.valid_right = right;
            }
        }
        if(isDefault) [calc_left, calc_right] = [left, right];
        let runId = TaManager.Keys.next().value;
        let content = {
            id: runId,
            instanceId: this.instance_id,
            className: this.ind_class_name,
            range: [calc_left, calc_right]
        };
        try{
            if(IS_WOEKER)
                self.postMessage({ cmd: 'calc_start', content});
            for (let i = calc_left; i <= calc_right; i++) {
                this.ind.next(i);
            }
            if(IS_WOEKER)
                self.postMessage({ cmd: 'calc_end', content});
        } catch (e){
            console.error(e);
            this.is_error = true;
            if(IS_WOEKER)
                self.postMessage({ cmd: 'calc_end', content});
            if(IS_WOEKER)
                self.postMessage({
                cmd: 'feedback',
                content: {
                    error: true,
                    type: 'run',
                    message: e.message,
                    func_name: this.ind.name,
                },
            });
        }
        return [calc_left, calc_right];

    };

    /**
     * 设定是否只在K线完成时刻发出交易信号
     * @param b : b==true,只在一根K线结束的时刻,才会发出交易信号, 一根K线最多只发出一个交易信号; b==false, K线每次变化时都可能发出交易信号, 一根K线可以发出多个交易信号
     *
     * 默认值为 false
     */
    TRADE_AT_CLOSE(b){
        this.trade_at_close = b;
    }
    /**
     * 设定是否强制使用开平循环模式
     * @param b : b==true,在未持仓情况下只会发出开仓信号, 有持仓时只会发出平仓信号. b==false, 有持仓时也可以发出开仓信号
     *
     * 默认值为 false
     */
    TRADE_OC_CYCLE(b){
        this.trade_oc_cycle = b;
    }
    ISLAST(i){
        return this._ds.last_id == i;
    }
    ORDER(current_i, direction, offset, volume, limit_price = undefined, order_symbol = this.trade_symbol) {
        if (this.is_error || !this._ds || this._ds.last_id == -1)
            return;
        if (!this.out_series_mark) {
            this.out_series_mark = this.OUTS('MARK', 'mk', {});
        }
        this.out_series_mark[current_i] = direction === "BUY" ? ICON_BUY : ICON_SELL;
        if (!this.enable_trade)
            return;

        // 要求在K线完成的时刻满足下单条件才会动作
        if (this.trade_at_close && (current_i <= this.last_i || this._ds.last_id != current_i + 1))
            return;
        // 要求任意时刻满足下单条件都会动作
        if (!this.trade_at_close && this._ds.last_id != current_i)
            return;

        this.last_i = current_i;
        //确定下单价格
        if (!limit_price){
            // 引用了上层的 TQ
            let quote = this.TQ.GET_QUOTE(order_symbol);
            let price_field = direction == "BUY" ? 'ask_price1' : 'bid_price1';
            if (!quote[price_field]) // 取不到对应的价格 包括 NaN 、 undefined
                return;
            limit_price = quote[price_field];
        }

        let position = this.TQ.GET_UNIT_POSITION(this.unit_id, order_symbol);
        let volume_open = 0;
        let volume_close = 0;
        if (offset == "CLOSE" || offset == "CLOSEOPEN") {
            let long_closeable_volume = position.volume_long?position.volume_long - position.order_volume_sell_close:0;
            let short_closeable_volume = position.volume_short?position.volume_short - position.order_volume_buy_close:0;
            if (direction == "BUY") {
                volume_close = Math.min(short_closeable_volume, volume);
            } else {
                volume_close = Math.min(long_closeable_volume, volume);
            }
            if (volume_close > 0){
                this.TQ.INSERT_ORDER({
                    symbol: order_symbol,
                    direction: direction,
                    offset: order_symbol.startsWith("SHFE.")?"CLOSETODAY":"CLOSE",
                    volume: volume_close,
                    limit_price: limit_price,
                    unit_id: this.unit_id,
                });
            }
        }
        if (offset == "OPEN" || offset == "CLOSEOPEN") {
            let long_position_volume = (position.volume_long + position.order_volume_buy_open)?position.volume_long + position.order_volume_buy_open:0;
            let short_position_volume = (position.volume_short + position.order_volume_sell_open)?position.volume_short + position.order_volume_sell_open:0;
            let pos_volume = (direction == "BUY")?long_position_volume:short_position_volume;
            if (pos_volume == 0 || !this.trade_oc_cycle){
                if (this.volume_limit) {
                    if (this.volume_limit > pos_volume)
                        volume_open = Math.min(this.volume_limit - pos_volume, volume);
                    else
                        volume_open = 0;
                } else {
                    volume_open = volume;
                }
            }
            if (volume_open > 0) {
                this.TQ.INSERT_ORDER({
                    symbol: order_symbol,
                    direction: direction,
                    offset: "OPEN",
                    volume: volume_open,
                    limit_price: limit_price,
                    unit_id: this.unit_id,
                });
            }
        }
    };
    CANCEL_ALL(){
        return this.TQ.CANCEL_ORDER(this.unit_id);
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
                return out_serial.slice(left, right+1);
        };
        return out_serial;
    }
}

class TaManager {
    constructor(tq){
        this.TQ = tq;
        this.class_dict = {};
        this.instance_dict = {};
    }

    register_indicator_class(ind_func){
        this.class_dict[ind_func.name] = ind_func;
    };

    unregister_indicator_class(ind_func_name) {
        delete this.class_dict[ind_func_name];
    };

    new_indicator_instance(ind_func, symbol, dur_nano, ds, params = {}, instance_id) {
        let ind_instance = new IndicatorRunContext(ind_func, instance_id, symbol, dur_nano, ds, this.TQ);
        this.instance_dict[instance_id] = ind_instance;
        for(let p in params){
            ind_instance.PARAMS[p] = params[p];
        }
        ind_instance.init();
        return ind_instance;
    };

    delete_indicator_instance(ind_instance) {
        delete this.instance_dict[ind_instance.instance_id];
    };
}

TaManager.Keys = GenerateSequence()

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
        this.id = RandomStr(4);
        if(mock_ws){
            this.ws = mock_ws;
        } else {
            this.ws = new TqWebsocket('ws://127.0.0.1:7777/', this);
        }

        this.dm = new DataManager();
        this.tm = new TaskManager();
        this.ta = new TaManager(this);

        this.START_TASK = this.tm.start_task.bind(this.tm);
        this.PAUSE_TASK = this.tm.pause_task.bind(this.tm);
        this.RESUME_TASK = this.tm.resume_task.bind(this.tm);
        this.STOP_TASK = this.tm.stop_task.bind(this.tm);

        this.ws_processor = {
            onmessage: [],
            onopen: [],
            onreconnect: [],
            onclose: [],
        }
        this.ws.init();
        this.UI = new Proxy(() => null, {
            get: function (target, key, receiver) {
                let res = UiUtils.readNodeBySelector('input#' + key);
                if (res[key]) return res[key];
                res = UiUtils.readNodeBySelector('input[name="' + key + '"]'); // radio
                if (res[key]) return res[key];
                res = UiUtils.readNodeBySelector('span#' + key);
                if (res[key]) return res[key];
                return undefined;
            },
            set: function (target, key, value, receiver) {
                UiUtils.writeNode(key, value);
            },
            apply: function (target, ctx, args) {
                let params = args[0];
                if (params) for (let key in params) UiUtils.writeNode(key, params[key]);
                else return UiUtils.readNodeBySelector('input');
                return args[0];
            }
        });
        this.init_ui(this);
    }

    register_ws_processor(evt, processor_func) {
        this.ws_processor[evt].push(processor_func);
    }

    onmessage(message) {
        switch(message.aid){
            case "rtn_data":
                this.on_rtn_data(message);
                break;
            case "update_indicator_instance":
                this.on_update_indicator_instance(message);
                break;
            case "update_custom_combine":
                if(!this.dm.datas.combines) this.dm.datas.combines = {};
                this.dm.datas.combines[message.symbol] = message.weights;
                break;
            default:
                return;
        }
        for(var f in this.ws_processor.onmessage){
            f(message);
        }
    }
    onopen() {
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
        this.tm.run();
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

        if (!this.ta.instance_dict[instance_id]) {
            instance = this.ta.new_indicator_instance(c, pack.ins_id, pack.dur_nano, ds, params, pack.instance_id);
        }else{
            instance = this.ta.instance_dict[pack.instance_id];
            if (ds != instance.ds || !Object.equals(params, instance.PARAMS)){
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
        if (pack.unit_id)
            instance.unit_id = pack.unit_id;
        instance.volume_limit = pack.volume_limit;

        let [calc_left, calc_right] = instance.calc_range();
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
            aid: "set_indicator_data",                    //必填, 标示此数据包为技术指标结果数据
            instance_id: instance.instance_id,                     //必填, 指标实例ID，应当与 update_indicator_instance 中的值一致
            epoch: instance.epoch,                                  //必填, 指标实例版本号，应当与 update_indicator_instance 中的值一致
            range_left: calc_left,                             //必填, 表示此数据包中第一个数据对应图表X轴上的位置序号
            range_right: calc_right,                            //必填, 表示此数据包中最后一个数据对应图表X轴上的位置序号
            serials: instance.out_define,
            datas: datas,
            drawings: instance.out_drawings,
        };
        this.ws.send_json(set_data);
    }

    IS_CHANGING(obj){
        return this.dm.is_changing(obj);
    }

    GET_ACCOUNT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'accounts', 'CNY');
    };

    GET_POSITION(symbol) {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'positions', symbol);
    };

    GET_UNIT_POSITION(unit_id, symbol) {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'units', unit_id, 'positions', symbol);
    };

    GET_COMBINE(combine_id){
        return this.dm.set_default({}, 'combines', 'USER.' + combine_id);
    }

    GET_POSITION_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'positions');
    }

    GET_TRADE_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'trades');
    };

    GET_ORDER_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'orders');
    };

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

    INSERT_ORDER({symbol, direction, offset, volume=1, price_type="LIMIT", limit_price, order_id, unit_id="EXT"}={}) {
        if (!this.dm.account_id) {
            Notify.error('未登录，请在软件中登录后重试。');
            return null;
        }
        if (!order_id)
            order_id = unit_id + '.' + RandomStr(8);
        let {exchange_id, instrument_id} = ParseSymbol(symbol);
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
            status: "ALIVE", // todo: 这里不需要 UNDEFINED 吗
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
        } else if (typeof order == 'string')  {
            let all_orders = this.dm.get('trade', this.dm.account_id, 'orders');
            for (var order_id in all_orders) {
                var ord = all_orders[order_id];
                if (ord.status == "ALIVE" && order_id.startsWith(order))
                    orders[order_id] = ord;
            }
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
        let define_context = new IndicatorDefineContext(ind_class);
        let classDefine = define_context.get_define();
        this.ws.send_json(classDefine);
    }
    UNREGISTER_INDICATOR_CLASS(ind_class_name){
        this.ta.unregister_indicator_class(ind_class_name);
        this.ws.send_json({
            "aid": "unregister_indicator_class",
            "name": ind_class_name
        });
    }
    NEW_INDICATOR_INSTANCE(ind_func, symbol, dur_sec, params={}, instance_id=RandomStr()) {
        let dur_nano = dur_sec * 1000000000;
        if (Object.keys(this.ta.class_dict) == 0){
            // 如果是 task 新建 NEW_INDICATOR_INSTANCE
            this.ws.send_json({
                "aid": "set_chart",
                "chart_id": RandomStr(),
                "ins_list": symbol,
                "duration": dur_nano,
                "view_width": 100, // 默认为 100
            });
        }
        let ds = this.dm.get_kline_serial(symbol, dur_nano);
        return this.ta.new_indicator_instance(ind_func, symbol, dur_sec, ds, params, instance_id);
    }
    DELETE_INDICATOR_INSTANCE(ind_instance){
        return this.ta.delete_indicator_instance(ind_instance);
    }

    /**
     * UI 相关
     */
    SET_STATE(cmd) {
        cmd = cmd.toUpperCase();
        if (cmd === 'START' || cmd === 'RESUME') {
            $('.panel-title .STATE').html('<span class="label label-success">运行中</span>');
            $('input').attr('disabled', true);
            $('button.START').attr('disabled', true);
        } else if (cmd === 'PAUSE') {
            $('.panel-title .STATE').html('<span class="label label-warning">已暂停</span>');
            $('input').attr('disabled', true);
            $('button.START').attr('disabled', true);
        } else if (cmd === 'STOP') {
            $('.panel-title .STATE').html('<span class="label label-danger">已停止</span>');
            $('input').attr('disabled', false);
            $('button.START').attr('disabled', false);
        }
    }

    ON_CLICK(dom_id) {
        var this_tq = this;
        return function () {
            if (this_tq.tm.events['click'] && this_tq.tm.events['click'][dom_id]) {
                var d = Object.assign({}, this_tq.tm.events['click'][dom_id]);
                return true;
            }
            return false;
        }
    }

    ON_CHANGE(dom_id) {
        var this_tq = this;
        return function () {
            if (this_tq.tm.events['change'] && this_tq.tm.events['change'][dom_id]) {
                var d = Object.assign({}, this_tq.tm.events['change'][dom_id]);
                return true;
            }
            return false;
        }
    }

    init_ui(){
        if (!IS_TEST && !IS_WOEKER) {
            var this_tq = this;
            $(() => {
                // init code
                var lines = $('#TRADE-CODE').text().split('\n');
                lines.forEach((el, i, arr) => lines[i] = el.replace(/\s{8}/, ''));
                var html = hljs.highlightAuto(lines.join('\n'));
                $('#code_container code').html(html.value);

                $('#collapse').on('hide.bs.collapse', () => $('#collapse_arrow').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down'));
                $('#collapse').on('show.bs.collapse', () => $('#collapse_arrow').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up'));

                $(document).on('click', function (e) {
                    // 页面 Click 事件统一处理 4 类按钮 START RESUME PAUSE END
                    var dataSet = Object.assign({}, e.target.dataset);
                    this_tq.tm.run({ type: e.type, id: e.target.id, data: dataSet });
                });
                $('input').on('change', function (e) {
                    var dataSet = Object.assign({}, e.target.dataset);
                    this_tq.tm.run({ type: e.type, id: e.target.id, data: dataSet });
                });
            });
        }
    }

}


/************************************************************
 * UI 部分
 *************************************************************/

const UiUtils = (function () {
    function _writeBySelector(sel, value) {
        let nodeList = document.querySelectorAll(sel);
        let success = false;
        nodeList.forEach((node, index, array) => {
            if (node.nodeName === 'SPAN' || node.nodeName === 'DIV') {
                node.innerText = value;
                success = true;
            } else if (node.nodeName === 'INPUT') {
                if (node.type === 'text' || node.type === 'number') {
                    node.value = value;
                    success = true;
                } else if (node.type === 'radio' && node.value === value) {
                    node.checked = true;
                    success = true;
                }
            }
        });
        return success;
    }
    return {
        readNodeBySelector (sel) {
            let nodeList = document.querySelectorAll(sel);
            let params = {};
            nodeList.forEach((node, index, array) => {
                Object.assign(params, UiUtils.readNode(node));
            });
            return params;
        },
        readNode (node) {
            if (node.nodeName == 'INPUT')
                switch (node.type) {
                    case 'number':
                        return {[node.id]: node.valueAsNumber};
                    case 'text':
                        return {[node.id]: node.value};
                    case 'radio':
                        return node.checked ?
                            {[node.name]: node.value} :
                            {};
                    default:
                        return {[node.id]: undefined};
                }
            else if (node.nodeName == 'SPAN')
                return {[node.id]: node.innerText}
        },
        writeNode (key, value) {
            if (!_writeBySelector('#' + key, value))
                _writeBySelector('input[type="radio"][name=' + key + ']', value);
        }
    }
})();
