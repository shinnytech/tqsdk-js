/**
 * 通用连接客户端应用
 */
const WS = new TqWebSocket('ws://127.0.0.1:7777/', {
    onmessage: function (message) {
        if (message.aid === 'rtn_data') {
            //收到行情数据包，更新到数据存储区
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

const TQ = {
    DATA: new Proxy(DM.datas, {
        get: function (target, key, receiver) {
            return Reflect.get(target, key, receiver);
        }
    }),
    CHANGING_DATA: new Proxy(DM.last_changed_data, {
        get: function (target, key, receiver) {
            return Reflect.get(target, key, receiver);
        }
    }),
    GET_ACCOUNT_ID () {
        return DM.get_account_id();
    },
    GET_ACCOUNT(from = DM.datas) {
        return DM.get_data('trade/' + DM.get_account_id() + '/accounts/CNY', from);
    },
    GET_POSITION(from = DM.datas) {
        return DM.get_data('trade/' + DM.get_account_id() + '/positions', from);
    },
    GET_SESSION(from = DM.datas) {
        return DM.get_data('trade/' + DM.get_account_id() + '/session', from);
    },
    GET_QUOTE(id, from = DM.datas) {
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
        return DM.get_data('quotes/' + id, from);
    },
    GET_ORDER(id, from = DM.datas) {
        if (type(id) == 'String') {
            return DM.get_data('trade/' + DM.get_account_id() + '/orders/' + id, from);
        } else {
            var orders = {};
            var all_orders = DM.get_data('trade/' + DM.get_account_id() + '/orders', from);
            for (var ex_or_id in all_orders) {
                var ord = all_orders[ex_or_id];
                if (ord.status == 'FINISHED' && ord.volume_orign == ord.volume_left) continue;
                if (ex_or_id.includes(BrowserId+'-'+PageId) && ord.unit_id == TaskManager.runningTask.unit_id) orders[ex_or_id] = ord;
            }
            return orders;
        }
    },
    GET_COMBINE(id, from = DM.datas) {
        return DM.get_data('combines/USER.' + id, from);
    },
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
    },
    ON_CLICK(id) {
        return function () {
            if (TaskManager.events['click'] && TaskManager.events['click'][id]) {
                var d = Object.assign({}, TaskManager.events['click'][id]);
                return d;
            }
            return false;
        }
    },
    ON_CHANGE(id) {
        return function () {
            if (TaskManager.events['change'] && TaskManager.events['change'][id]) {
                var d = Object.assign({}, TaskManager.events['change'][id]);
                return d;
            }
            return false;
        }
    },
    SEND_MESSAGE(obj) {
        WS.sendJson(obj);
    },
    INSERT_ORDER(ord) {
        if (!DM.get_account_id()) {
            Notify.error('未登录，请在软件中登录后重试。');
            return false;
        }

        var order_id = BrowserId + '-' + PageId + '-' + GenOrderId.next().value;
        var unit_id = ord.unit_id ? ord.unit_id : TaskManager.runningTask.unit_id;
        var send_obj = {
            "aid": "insert_order",
            "unit_id": unit_id,
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

        var id = unit_id + '|' + order_id;
        if (!TQ.GET_ORDER(id)) {
            var orders = {};
            orders[id] = {
                order_id: order_id,
                unit_id: unit_id,
                status: "UNDEFINED",
                volume_orign: ord.volume,
                volume_left: ord.volume,
                exchange_id: ord.exchange_id,
                instrument_id: ord.instrument_id
            }
            DM.update_data({
                "trade": {
                    [DM.get_account_id()]: {
                        "orders": orders
                    }
                }
            }, 'local');
        }
        return TQ.GET_ORDER(id);
    },

    CANCEL_ORDER(order) {
        if (order && order.exchange_order_id) {
            WS.sendJson({
                "aid": "cancel_order",
                "order_id": order.order_id,
                "unit_id": TaskManager.runningTask.unit_id
            });
        } else if (TaskManager.runningTask.unit_mode) {
            var orders = TQ.GET_ORDER();
            for (var order in orders) {
                if (orders[order].status == 'ALIVE' || orders[order].status == "UNDEFINED")
                    WS.sendJson({
                        "aid": "cancel_order",
                        "order_id": orders[order].order_id,
                        "unit_id": TaskManager.runningTask.unit_id
                    });
            }
        }
    }
}

class Task {
    constructor(id, func, waitConditions = null) {
        this.id = id;
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
        } else {
            return node;
        }
    }

    function checkTask(task) {
        var status = {};
        task.timeout = undefined;
        for (var cond in task.waitConditions) {
            if (cond.toUpperCase() === 'TIMEOUT') {
                task.timeout = task.waitConditions[cond];
                if ((new Date()).getTime() >= task.endTime) status['TIMEOUT'] = true;
                else status['TIMEOUT'] = false;
                continue;
            }
            status[cond] = checkItem(task.waitConditions[cond])
        }
        return status;
    }

    function runTask(task) {
        TaskManager.runningTask = task;
        var waitResult = checkTask(task);
        /**
         * ret: { value, done }
         */
        for (var r in waitResult) {
            if (waitResult[r]) {
                // waitConditions 中某个条件为真才执行 next
                var ret = task.func.next(waitResult);
                if (ret.done) {
                    task.stopped = true;
                    TaskManager.any_task_stopped = true;
                } else {
                    if (task.timeout) task.endTime = getEndTime(task.timeout);
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
                if (err == 'not logined') Notify.error('未登录，请在软件中登录后重试。');
                else console.log(err)
            }
        }
        if (obj) {
            delete TaskManager.events[obj.type][obj.id];
        }
        if (TaskManager.any_task_stopped) TaskManager.run();
    }

    setInterval(() => {
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
    }, intervalTime);

    function add(func) {
        var id = GenTaskId.next().value;
        var task = new Task(id, func);
        task.unit_id = id;
        aliveTasks[id] = task;
        TaskManager.runningTask = task;
        var ret = task.func.next();
        if (ret.done) {
            task.stopped = true;
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

    function remove(task) {
        delete aliveTasks[task.id];
    }

    return {
        runningTask: null,
        events: {},
        add,
        remove,
        run,
        getAll: function () {
            return aliveTasks;
        }
    }
}());

TQ.START_TASK = function (func) {
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

TQ.STOP_TASK = function (task) {
    if (task) task.stop();
    return null;
}

TQ.PAUSE_TASK = function (task) {
    task.pause();
}
TQ.RESUME_TASK = function (task) {
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
                return { [node.id]: node.innerText }
        },
        writeNode(key, value) {
            if (!_writeBySelector('#' + key, value))
                _writeBySelector('input[type="radio"][name=' + key + ']', value);
        }
    }
})();

TQ.UI = new Proxy(() => null, {
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