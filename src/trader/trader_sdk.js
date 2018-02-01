/**
 * 通用连接客户端应用
 */
const AppDataStatus = {
    receivedData: false,
    isLogin: false
};
const WS = new TqWebSocket('ws://127.0.0.1:7777/', {
    onmessage: function (message) {
        if (message.aid === 'rtn_data') {
            //收到行情数据包，更新到数据存储区
            if (!AppDataStatus.receivedData) AppDataStatus.receivedData = true;
            if (!AppDataStatus.isLogin && DM.get_account_id()) AppDataStatus.isLogin = true;
            DM.update_data(message.data);
            TaskManager.run();
        } else if (message.aid === 'update_custom_combine') {
            // 用户自定义组合
            // todo: 合并到 rtn_data, 这里就不需要了
            let combines = {};
            combines[message.symbol] = message.weights;
            DM.update_data({ combines });
            TaskManager.run();
        }
    },
    onopen: function () {
        WS.sendJson({
            aid: 'sync_datas',
            sync_datas: {},
        });
    },
    onclose: function () {
        DM.clear_data();
    },
    onreconnect: function () { }
});

WS.init();

/**
 * 浏览器 - BrowserId
 * 页面 - PageId
 */
const BrowserId = (() => {
    let b_id = localStorage.getItem('TianqinBrowserId');
    if (!b_id) {
        b_id = RandomStr(4);
        localStorage.setItem('TianqinBrowserId', b_id);
    }
    return b_id;
})();

const PageId = (() => {
    let p_id = localStorage.getItem('TianqinPageId');
    p_id = p_id ? (parseInt(p_id, 36) + 1).toString(36) : '0';
    localStorage.setItem('TianqinPageId', p_id);
    return p_id;
})();

/**
 * unit_id = [TaskId]
 * order_id = [BrowserId]-[PageId]-[OrderId] 
 */

const GenTaskId = GenerateSequence();
const GenOrderId = GenerateSequence();

class TaskCtx {
    constructor() {
        this.unit_id = null;
        this.unit_mode = true;
        this.account_id = '';
        this.orders = {};
        this.LATEST_DATA = new Proxy(DM.datas, {
            get: function (target, key, receiver) {
                return Reflect.get(target, key, receiver);
            }
        });
        this.LAST_UPDATED_DATA = new Proxy(DM.last_changed_data, {
            get: function (target, key, receiver) {
                return Reflect.get(target, key, receiver);
            }
        });
    }

    _cancelOrd(order_id) {
        WS.sendJson({
            "aid": "cancel_order",
            "order_id": order_id,
            "unit_id": this.unit_id
        });
    }

    _insertOrd(ord) {
        var order_id = BrowserId + '-' + PageId + '-' + GenOrderId.next().value;
        var send_obj = {
            "aid": "insert_order",
            "unit_id": this.unit_id,
            "order_id": order_id,
            "exchange_id": ord.exchange_id,
            "instrument_id": ord.instrument_id,
            "direction": ord.direction,
            "offset": ord.offset,
            "volume": ord.volume,
            "price_type": "LIMIT",
            "limit_price": ord.limit_price
        };
        WS.sendJson(send_obj);

        var id = this.unit_id + '|' + order_id;
        if (!this.GET_ORDER(id)) {
            var orders = {};
            orders[id] = {
                order_id: order_id,
                unit_id: this.unit_id,
                status: "UNDEFINED",
                volume_orign: ord.volume,
                volume_left: ord.volume,
                exchange_id: ord.exchange_id,
                instrument_id: ord.instrument_id
            }
            DM.update_data({
                "trade": {
                    [this.account_id]: {
                        "orders": orders
                    }
                }
            }, 'local');
        }
        return id;
    }

    INSERT_ORDER(ord) {
        this.account_id = DM.get_account_id();
        if (!this.account_id) {
            Notify.error('未登录，请在软件中登录后重试。');
            return false;
        }
        var ord_id = this._insertOrd(ord);
        return this.orders[ord_id] = this.GET_ORDER(ord_id);
    }

    CANCEL_ORDER(order) {
        if (order && order.exchange_order_id) {
            this._cancelOrd(order.order_id);
        } else if (this.unit_mode) {
            for (var order in this.orders) {
                if (this.orders[order].status == 'ALIVE' || this.orders[order].status == "UNDEFINED")
                    this._cancelOrd(this.orders[order].order_id);
            }
        }
    }

    _on_event_callback(eType, id) {
        return function () {
            if (TaskManager.events[eType] && TaskManager.events[eType][id]) {
                var d = Object.assign({}, TaskManager.events[eType][id]);
                delete TaskManager.events[eType][id];
                return d;
            }
            return false;
        }
    }

    ON_CLICK(id) {
        return this._on_event_callback('click', id);
    }

    ON_CHANGE(id) {
        return this._on_event_callback('change', id);
    }

    GET_ACCOUNT_ID() {
        this.account_id = DM.get_account_id();
        if (this.account_id) return this.account_id;
        else throw "not logined";
    }

    GET_ACCOUNT(fromOrigin = DM.datas) {
        return DM.get_data('trade/' + this.account_id + '/accounts/CNY', fromOrigin);
    }

    GET_POSITION(fromOrigin = DM.datas) {
        return DM.get_data('trade/' + this.account_id + '/positions', fromOrigin);
    }

    GET_SESSION(fromOrigin = DM.datas) {
        return DM.get_data('trade/' + this.account_id + '/session', fromOrigin);
    }

    GET_QUOTE(id, fromOrigin = DM.datas) {
        // 订阅行情
        var ins_list = DM.datas.ins_list;
        if (ins_list && !ins_list.includes(id)) {
            id = (ins_list.substr(-1, 1) === ',') ? id : (',' + id);
            var s = ins_list + id;
            WS.sendJson({
                aid: "subscribe_quote",
                ins_list: s
            });
        }
        return DM.get_data('quotes/' + id, fromOrigin);
    }

    GET_ORDER(id, fromOrigin = DM.datas) {
        if (type(id) == 'String') {
            return DM.get_data('trade/' + this.account_id + '/orders/' + id, fromOrigin);
        } else {
            var orders = {};
            for (var ex_or_id in this.orders) {
                var ord = this.orders[ex_or_id];
                if (ord.status == 'FINISHED' && ord.volume_orign == ord.volume_left) continue;
                // if (ord.status == 'UNDEFINED') continue;
                orders[ex_or_id] = ord;
            }
            return orders;
        }
    }

    GET_COMBINE(name, fromOrigin = DM.datas) {
        return DM.get_data('combines/USER.' + name, fromOrigin);
    }

    SET_STATE(cmd) {
        cmd = cmd.toUpperCase();
        if (cmd === 'START' || cmd === 'RESUME') {
            $('.panel-title .STATE').html('<span class="label label-success">运行中</span>');
            $('input').attr('disabled', true);
            $('button.START').attr('disabled', true);
        } else if (cmd === 'PAUSE') {
            $('.panel-title .STATE').html('<span class="label label-warning">暂停</span>');
            $('input').attr('disabled', true);
            $('button.START').attr('disabled', true);
        } else if (cmd === 'STOP') {
            $('.panel-title .STATE').html('<span class="label label-danger">停止</span>');
            $('input').attr('disabled', false);
            $('button.START').attr('disabled', false);
        }
    }
}

class Task {
    constructor(id, func, waitConditions = null) {
        this.id = id;
        this.func = func;
        this.paused = false;
        this.waitConditions = waitConditions;
        this.timeout = 6000000; // 每个任务默认时间
        this.endTime = 0;
        this.stopped = false;
        this.events = {}
        this.ctx = null;
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

const TaskManager = (function (task) {
    var aliveTasks = {};

    var intervalTime = 50; // 任务执行循环间隔

    function getEndTime(t) {
        return (new Date()).getTime() + t;
    }

    function checkItem(node) {
        if (typeof node == 'function') {
            return node();
        } else if (node instanceof Task) {
            return node.stopped;
        } else if (node instanceof Array) {
            // array &&
            var status = [];
            for (var i in node) {
                status[i] = checkItem(node[i]);
            }
            return status;
        } else if (node instanceof Object) {
            // object ||
            var status = {};
            for (var k in node) {
                status[k] = checkItem(node[k]);
            }
            return status;
        }
    }

    function checkTask(task) {
        var status = {};

        for (var cond in task.waitConditions) {
            if (cond.toUpperCase() === 'TIMEOUT') {
                task.timeout = task.waitConditions[cond];
                continue;
            }
            status[cond] = checkItem(task.waitConditions[cond])
        }

        if ((new Date()).getTime() >= task.endTime) status['TIMEOUT'] = true;
        else status['TIMEOUT'] = false;

        return status;
    }

    function runTask(task) {
        var waitResult = checkTask(task);
        /**
         * ret: { value, done }
         */
        function isFalseObj(o) {
            if (type(o) == 'Array' || type(o) == 'String') { return o.length > 0 ? true : false; }
            if (type(o) == 'Object') { return Object.keys(o).length > 0 ? true : false; }
            return o;
        }
        for (var r in waitResult) {
            if (waitResult[r]) {
                // waitConditions 中某个条件为真才执行 next
                var ret = task.func.next(waitResult);
                if (ret.done) {
                    task.stopped = true;
                    TaskManager.any_task_stopped = true;
                    // remove(task);
                } else {
                    task.endTime = getEndTime(task.timeout);
                    task.waitConditions = ret.value;
                }
                break;
            }
        }
    }

    function run(obj) {
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
                if (err == 'not logined') Notify.error('未登录，请在软件中登录后重试。')
            }
        }
        if(TaskManager.any_task_stopped) TaskManager.run();
    }

    setInterval(() => {
        for (var taskId in aliveTasks) {
            var task = aliveTasks[taskId];
            if (task.paused) {
                task.endTime += intervalTime;
            } else {
                var now = (new Date()).getTime();
                if (task.endTime <= now) runTask(task);
            }
        }
    }, intervalTime);

    function add(func, context) {
        var id = GenTaskId.next().value;
        var task = new Task(id, func);
        task.ctx = context;
        task.ctx.unit_id = id;
        aliveTasks[id] = task;
        var ret = task.func.next();
        if (ret.done) {
            task.stopped = true;
            // remove(task);
        } else {
            for (var cond in ret.value) {
                if (cond.toUpperCase() === 'TIMEOUT') {
                    task.timeout = ret.value[cond];
                    break;
                }
            }
            task.endTime = getEndTime(task.timeout);
            task.waitConditions = ret.value;
        }
        return task;
    }

    function remove(task) {
        delete aliveTasks[task.id];
    }

    return {
        events: {},
        add,
        remove,
        run,
        getAll: function () {
            return aliveTasks;
        }
    }
}());

const START_TASK = function (func) {
    // if (!AppDataStatus.receivedData) {
    //     Notify.error('还未接收到数据包，请稍后重试。')
    //     return false;
    // }
    // if (!AppDataStatus.isLogin) {
    //     Notify.error('未登录，请在软件中登录后重试。')
    //     return false;
    // }

    if (typeof func === 'function') {
        var context = new TaskCtx();
        var args = [context];
        if (arguments.length > 1) {
            var len = 1;
            while (len < arguments.length)
                args.push(arguments[len++]);
        }
        var f = func.apply(null, args);
        if (f.next && (typeof f.next === 'function')) {
            return TaskManager.add(f, context);
        } else {
            console.log('task 参数类型错误');
        }
    } else {
        console.log('task 参数类型错误');
    }
}

const STOP_TASK = function (task) {
    if (task) task.stop();
    return null;
}

const PAUSE_TASK = function (task) {
    task.pause();
}
const RESUME_TASK = function (task) {
    task.resume();
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
        readNodeBySelector(sel) {
            let nodeList = document.querySelectorAll(sel);
            let params = {};
            nodeList.forEach((node, index, array) => {
                Object.assign(params, UiUtils.readNode(node));
            });
            return params;
        },
        readNode(node) {
            if (node.nodeName == 'INPUT')
                switch (node.type) {
                    case 'number': return { [node.id]: node.valueAsNumber };
                    case 'text': return { [node.id]: node.value };
                    case 'radio': return node.checked ? { [node.name]: node.value } : {};
                    default: return { [node.id]: undefined };
                }
            else if (node.nodeName == 'SPAN')
                return {[node.id]: node.innerText}
        },
        writeNode(key, value) {
            if (!_writeBySelector('#' + key, value))
                _writeBySelector('input[type="radio"][name=' + key + ']', value);
        }
    }
})();

const UI = new Proxy(() => null, {
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

function INIT_UI() {
    // init code
    var lines = $('#TRADE-CODE').text().split('\n');
    lines.forEach((el, i, arr) => lines[i] = el.replace(/\s{8}/, ''));
    var html = hljs.highlightAuto(lines.join('\n'));
    $('#code_container code').html(html.value);

    $('#collapse').on('hide.bs.collapse', () => $('#collapse_arrow').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down'));
    $('#collapse').on('show.bs.collapse', () => $('#collapse_arrow').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up'));
}

$(() => {
    INIT_UI();
    $(document).on('click', function (e) {
        // 页面 Click 事件统一处理 4 类按钮 START RESUME PAUSE END
        var dataSet = Object.assign({}, e.target.dataset);
        TaskManager.run({ type: e.type, id: e.target.id, data: dataSet });
    });
    $('input').on('change', function (e) {
        var dataSet = Object.assign({}, e.target.dataset);
        TaskManager.run({ type: e.type, id: e.target.id, data: dataSet });
    });
});