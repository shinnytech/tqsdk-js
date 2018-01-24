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

    onreconnect: function () {

    }
});

WS.init();

// 按顺序生成 key 记录, 每次都连着上一次的
const GenerateKeyLocal = function (name, key) {
    var str = localStorage.getItem(name);
    var obj = str ? JSON.parse(str) : {};
    obj[key] = obj[key] ? (parseInt(obj[key], 36) + 1).toString(36) : '0';
    localStorage.setItem(name, JSON.stringify(obj));
    return obj[key];
}

// 按顺序生成 key 记录，每次都重新开始
function* GenerateKey() {
    let i = 0;
    while (true) {
        yield i.toString(36);
        i++;
    }
}
const GenTaskId = GenerateKey();

/**
 * trade task
 */

const trader_context = function () {
    function insertOrder(ord) {
        var account_id = DM.get_account_id();
        var session = DM.get_session();
        if (!account_id || !session) {
            Notify.error('未登录，请在软件中登录后重试。')
            return false;
        }

        var session_id = session.session_id;

        var order_id = GenerateKeyLocal('orderid', session_id);
        var send_obj = {
            "aid": "insert_order",
            "order_id": order_id,
            "user_id": DM.get_session().user_id,
            "exchange_id": ord.exchange_id,
            "instrument_id": ord.instrument_id,
            "direction": ord.direction,
            "offset": ord.offset,
            "volume": ord.volume,
            "price_type": "LIMIT",
            "limit_price": ord.limit_price
        };
        WS.sendJson(send_obj);
        var id = session_id + '|' + order_id;
        if (DM.get_order(id)) {
            return DM.get_order(id);
        } else {
            var orders = {};
            orders[id] = {
                order_id: order_id,
                session_id: session_id,
                exchange_order_id: id,
                status: "UNDEFINED",
                volume_orign: ord.volume,
                volume_left: ord.volume,
                exchange_id: ord.exchange_id,
                instrument_id: ord.instrument_id
            }
            DM.update_data({
                "trade": {
                    [account_id]: {
                        "orders": orders
                    }
                }
            });
            return DM.get_order(id);
        }
    };

    function cancelOrder(order) {
        if (order.exchange_order_id) {
            var send_obj = {
                "aid": "cancel_order", //必填, 撤单请求
                "order_session_id": order.session_id, //必填, 委托单的session_id
                "order_id": order.order_id, //必填, 委托单的order_id
                "exchange_id": order.exchange_id, //必填, 交易所
                "instrument_id": order.instrument_id, //必填, 合约代码
                //"action_id": "0001", //当指令发送给飞马后台时需填此字段,
                "user_id": DM.get_session().user_id, //可选, 与登录用户名一致, 当只登录了一个用户的情况下,此字段可省略
            }
            WS.sendJson(send_obj);
            return order;
        } else {
            console.info('CANCEL_ORDER:', '传入的参数不是 ORDER 类型', order);
            return null;
        }
    }

    function get_data(target, path){

    }


    return {
        INSERT_ORDER: insertOrder,
        CANCEL_ORDER: cancelOrder,

        GET_DATA: get_data,
        SET_DATA: set_data,

        GET_ACCOUNT: DM.get_account,
        GET_POSITION: DM.get_positions,
        GET_SESSION: DM.get_session,
        GET_QUOTE: DM.get_quote,
        GET_ORDER: DM.get_order,
        GET_COMBINE: DM.get_combine,

        ON_CHANGED: function (obj) {
            // ON_CHANGED 判断制定数据对象是否更新
            return () => {
                if (obj == undefined) return true;
                for (let i = 0; TaskManager.changedList && i < TaskManager.changedList.length; i++)
                    if (TaskManager.changedList[i] == obj) return true;
                return false;
            }
        },
        ON_CLICK: function (click_id) {
            return function () {
                if (TaskManager.event && click_id === TaskManager.event) return true;
                return false;
            }
        }
    }
}();

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
            var res = checkTask(node);
            for (var r in res) {
                if (res[r]) return true;
            }
            return false;
        } else if (node instanceof Array) {
            // array &&
            for (var i in node) {
                if (!checkItem(node[k])) {
                    return false;
                }
            }
            return true;
        } else if (node instanceof Object) {
            // object ||
            for (var k in node) {
                if (checkItem(node[k])) {
                    return true;
                }
            }
            return false;
        }
    }

    function checkTask(task) {
        var status = {};

        for (var cond in task.waitConditions) {
            if (cond.toUpperCase() === 'TIMEOUT') {
                task.timeout = task.waitConditions[cond];
                continue;
            }
            if (checkItem(task.waitConditions[cond])) status[cond] = true;
            else status[cond] = false;
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
        for (var r in waitResult) {
            if (waitResult[r]) {
                // waitConditions 中某个条件为真才执行 next
                var ret = task.func.next(waitResult);
                if (ret.done) {
                    task.stopped = true;
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
        TaskManager.changedList = obj.changedList ? obj.changedList : null;
        TaskManager.event = obj.event ? obj.event : null;

        for (var taskId in aliveTasks) {
            if (aliveTasks[taskId].paused) continue;
            runTask(aliveTasks[taskId]);
            if (aliveTasks[taskId] && aliveTasks[taskId].stopped) {
                remove(aliveTasks[taskId]);
                continue;
            }
        }
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

    function add(func) {
        var id = GenTaskId.next().value;
        var task = new Task(id, func);
        aliveTasks[id] = task;
        var ret = task.func.next();
        // console.log(ret.value)
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
        changedList: null,
        add,
        remove,
        run,
        setEvent: function (event) {
            for (var taskId in aliveTasks) {
                if (aliveTasks[taskId].paused || aliveTasks[taskId].stopped) continue;
                var task = aliveTasks[taskId];
                task.events = event;
            }
        },
        getAll: function () {
            return aliveTasks;
        }
    }
}());

const START_TASK = function (func) {
    if (typeof func === 'function') {
        var args = [trader_context];
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

/**
 * DATA SERIES
 */

class DATA_SERIAL {
    constructor(id) {
        this.id = id;
        this.datas = [];
        this.begin = null;
        this.end = null;
        this.binding = {};
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

/**************************************************************
 * 生成函数 全局？ctx？
 *************************************************************/
Object.assign(window, trader_context)

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
            switch (node.type) {
                case 'number': return { [node.id]: node.valueAsNumber };
                case 'text': return { [node.id]: node.value };
                case 'radio': return node.checked ? { [node.name]: node.value } : {};
                default: return { [node.id]: undefined };
            }
        },
        writeNode(key, value) {
            if (!_writeBySelector('#' + key, value))
                _writeBySelector('input[type="radio"][name=' + key + ']', value);
        }
    }
})();

const UI_DATAS = new Proxy(() => null, {
    get: function (target, key, receiver) {
        let nodeList = document.querySelectorAll('input#' + key);
        let res = null;
        if (nodeList.length > 0) res = UiUtils.readNode(nodeList[0]);
        else res = UiUtils.readNodeBySelector('input[name="' + key + '"]'); // radio 
        return res[key] ? res[key] : undefined;
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

function SET_STATE(cmd) {
    cmd = cmd.toUpperCase();
    if (cmd === 'START' || cmd === 'RESUME') {
        $('.panel-title .STATE').html('<span class="label label-success">运行中</span>');
        $('input').attr('disabled', true);
        $('button.START').attr('disabled', true);
    } else if (cmd === 'PAUSE') {
        $('.panel-title .STATE').html('<span class="label label-warning">暂停</span>');
        $('input').attr('disabled', true);
        $('button.START').attr('disabled', true);
    } else if (cmd === 'END') {
        $('.panel-title .STATE').html('<span class="label label-danger">停止</span>');
        $('input').attr('disabled', false);
        $('button.START').attr('disabled', false);
    }
}

$(() => {
    INIT_UI();
    $(document).on('click', function (e) {
        console.log(e.target.dataset);
        console.log(e.target.id);
        // 页面 Click 事件统一处理
        // 4 类按钮 START RESUME PAUSE END
        // events.publish(e.target.id, e.target.dataset)
        TaskManager.run({event: e.target.id});

    })
});

/**
 * 返回指定变量的数据类型
 * @param  {Any} data
 * @return {String}
 */
const type = (d) => Object.prototype.toString.call(d).slice(8, -1);

/**
 * 显示通知
 */
const Notify = (function () {
    let debug = false;

    let defaults = {
        layout: 'topRight',
        theme: 'relax',// defaultTheme, relax, bootstrapTheme, metroui
        type: 'information',
        force: true,
        timeout: 2000,
        maxVisible: 50,
        closeWith: ['click', 'button'],
    };

    function getNotyFun(type) {
        if (!debug) {
            return function (text) {
                return noty(Object.assign(defaults, { text, type }));
            };
        } else {
            return function (text) {
                return console.log('%c%s', 'color: #7C37D4', type + ' : ' + text);
            };
        }
    }

    let notys = {};
    notys.success = getNotyFun('success');
    notys.error = notys.err = getNotyFun('error');
    notys.warning = notys.warn = getNotyFun('warning');
    notys.information = notys.info = getNotyFun('information');
    notys.notification = notys.noty = getNotyFun('notification');
    return notys;
}());
