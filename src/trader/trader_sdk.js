/**
 * 通用连接客户端应用
 */
const WS = new TqWebSocket('ws://127.0.0.1:7777/', {
    onmessage: function (message) {
        if (message.aid === 'rtn_data') {
            //收到行情数据包，更新到数据存储区
            for (let i = 0; i < message.data.length; i++) {
                DM.update_data(message.data[i]);
            }
            TaskManager.run(message.data);
        } else if (message.aid === 'update_custom_combine') {
            // 用户自定义组合
            let combines = {};
            combines[message.symbol] = message.weights;
            DM.update_data({ combines });
            TaskManager.run(message.symbol);
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
        var session_id = DM.get_session().session_id;
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
                    "SIM": {
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
                "aid": "cancel_order",          //必填, 撤单请求
                "order_session_id": order.session_id,     //必填, 委托单的session_id
                "order_id": order.order_id,             //必填, 委托单的order_id
                "exchange_id": order.exchange_id,         //必填, 交易所
                "instrument_id": order.instrument_id,      //必填, 合约代码
                //"action_id": "0001",            //当指令发送给飞马后台时需填此字段,
                "user_id": DM.get_session().user_id,             //可选, 与登录用户名一致, 当只登录了一个用户的情况下,此字段可省略
            }
            WS.sendJson(send_obj);
            return order;
        } else {
            console.info('CANCEL_ORDER:', '传入的参数不是 ORDER 类型', order);
            return null;
        }
    }

    function quoteChange(quote) {
        var ins_id = '';
        if (!quote) {
            console.error(quote, ' 不存在');
            return false;
        }
        if (typeof quote === 'string') {
            ins_id = quote;
        } else if (quote.instrument_id) {
            ins_id = quote.instrument_id;
        } else {
            // TODO: 抛出错误
            console.error('没有找到合约id');
            return false;
        }

        for (let i = 0; i < TaskManager.tempDiff.length; i++) {
            if (TaskManager.tempDiff[i].quotes && TaskManager.tempDiff[i].quotes[ins_id]) return true;
        }
        return false;
    }

    function orderChange(order) {
        var order_id = '';
        if (typeof order === 'string') {
            order_id = order;
        } else if (order.exchange_order_id) {
            order_id = order.exchange_order_id;
        } else {
            // TODO: 抛出错误
            console.error('没有找到委托单id');
            return false;
        }

        for (let i = 0; i < TaskManager.tempDiff.length; i++) {
            if (TaskManager.tempDiff[i].trade
                && TaskManager.tempDiff[i].trade['SIM']
                && TaskManager.tempDiff[i].trade['SIM']['orders']
                && TaskManager.tempDiff[i].trade['SIM']['orders'][order_id]) return true;
        }
        return false;
    }

    function combineChanged(name) {
        return TaskManager.tempDiff === 'USER.' + name;
    }

    return {
        INSERT_ORDER: insertOrder,
        CANCEL_ORDER: cancelOrder,

        QUOTE_CHANGED: quoteChange,
        ORDER_CHANGED: orderChange,
        COMBINE_CHANGED: combineChanged,

        GET_ACCOUNT: DM.get_account,
        GET_POSITION: DM.get_positions,
        GET_SESSION: DM.get_session,
        GET_QUOTE: DM.get_quote,
        GET_ORDER: DM.get_order,
        GET_COMBINE: DM.get_combine
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

    function run(diffData) {
        TaskManager.tempDiff = diffData ? diffData : null;
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
        tempDiff: null,
        add,
        remove,
        run,
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
 * 返回指定变量的数据类型
 * @param  {Any} data
 * @return {String}
 */
const type = (d) => Object.prototype.toString.call(d).slice(8, -1);

/************************************************************
 * UI 部分
 *************************************************************/

UiUtils = {};

UiUtils.readNodeBySelector = function (sel) {
    let nodeList = document.querySelectorAll(sel);
    let params = {};
    nodeList.forEach((node, index, array) => {
        Object.assign(params, UiUtils.readNode(node));
    });
    return params;
}

UiUtils.readNode = function (node) {
    switch (node.type) {
        case 'number': return { [node.id]: node.valueAsNumber };
        case 'text': return { [node.id]: node.value };
        case 'radio': return node.checked ? { [node.name]: node.value } : {};
        default: return { [node.id]: undefined };
    }
}

UiUtils.writeNode = function (key, value) {
    function _writeBySelector(sel) {
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
    if (!_writeBySelector('.tq-datas#' + key)) _writeBySelector('input.tq-datas[type="radio"][name=' + key + ']');
}

const UI_DATAS = new Proxy(() => null, {
    get: function (target, key, receiver) {
        let nodeList = document.querySelectorAll('input.tq-datas#' + key);
        if (nodeList.length > 0) return UiUtils.readNode(nodeList[0]);
        else { // radio 
            let res = UiUtils.readNodeBySelector('input.tq-datas[name="' + key + '"]');
            return res[key] ? res[key] : undefined;
        }
    },
    set: function (target, key, value, receiver) {
        UiUtils.writeNode(key, value);
    },
    apply: function (target, ctx, args) {
        let params = args[0];
        if (params) for (let key in params) UiUtils.writeNode(key, params[key]);
        else return UiUtils.readNodeBySelector('input.tq-datas');
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

function ENABLE_INPUTS(isAble) {
    $('input.tq-datas').attr('disabled', !!isAble);
    $('button.tq-datas').attr('disabled', !!isAble);
}

$(() => INIT_UI());
