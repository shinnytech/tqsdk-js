const WS = new TqWebSocket('ws://127.0.0.1:7777/', {
    onmessage: function (message) {
        if (message.aid === 'rtn_data') {
            //收到行情数据包，更新到数据存储区
            for (let i = 0; i < message.data.length; i++) {
                DM.update_data(message.data[i]);
            }
            // TODO: 判断 waitConditions 是否成立
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

    },
});

WS.init();

// 按顺序生成 key 记录, 每次都连着上一次的
const GenerateKeyLocal = function (name) {
    var k = localStorage.getItem(name);
    if (k) k = (parseInt(k, 36) + 1).toString(36);
    else k = '1';
    localStorage.setItem(name, k);
    return k;
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


/************** 以上是通用方法 **************/


const trader_context = function () {
    function insertOrder(ord) {
        var order_id = GenerateKeyLocal('orderid');
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
        var session_id = DM.get_session().session_id;
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

    return {
        INSERT_ORDER: insertOrder,
        CANCEL_ORDER: cancelOrder,
        GET_ACCOUNT: DM.get_account,
        GET_POSITION: DM.get_positions,
        GET_SESSION: DM.get_session,
        GET_QUOTE: DM.get_quote,
        GET_ORDER: DM.get_order,
    }
}();

class Task {
    constructor(id, func, waitConditions = null) {
        this.id = id;
        this.func = func;
        this.paused = false;
        this.waitConditions = waitConditions;
        this.timeout = 0;
        this.executeTime = 0;
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
    // TODO: 修改成监听 onmessage 事件执行
    var intervalTime = 100; // 任务执行循环间隔

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
        // 默认 timeout = 10000 ms
        task.timeout = (task.waitConditions && task.waitConditions.TIMEOUT) ? task.waitConditions.TIMEOUT : 10000;

        for (var cond in task.waitConditions) {
            if (cond === 'TIMEOUT') continue;
            if (checkItem(task.waitConditions[cond])) status[cond] = true;
            else status[cond] = false;
        }

        if (task.executeTime >= task.timeout) status['TIMEOUT'] = true;
        else status['TIMEOUT'] = false;

        return status;
    }

    function runTask(task) {
        var waitResult = checkTask(task);
        // console.log(waitResult)

        /**
         * ret: { value, done }
         */
        for (var r in waitResult) {
            if (waitResult[r]) {
                // waitConditions 中某个条件为真才执行 next
                var ret = task.func.next(waitResult);
                if (ret.done) {
                    remove(task);
                } else {
                    task.executeTime = 0;
                    task.waitConditions = ret.value;
                }
                break;
            }
        }
    }

    function run() {
        for (var taskId in aliveTasks) {
            if (aliveTasks[taskId].paused) continue;
            runTask(aliveTasks[taskId]);
            if (aliveTasks[taskId] && aliveTasks[taskId].stopped) 
                remove(aliveTasks[taskId]);;
        }
    }

    setInterval(() => {
        for (var taskId in aliveTasks) {
            if (aliveTasks[taskId].paused) continue;
            aliveTasks[taskId].executeTime += intervalTime;
        }
    }, intervalTime);

    function add(func) {
        var id = GenTaskId.next().value;
        var task = new Task(id, func);
        aliveTasks[id] = task;
        var ret = task.func.next();
        if (ret.done) {
            remove(task);
        } else {
            task.waitConditions = ret.value;
        }
        return task;
    }

    function remove(task) {
        delete aliveTasks[task.id];
    }

    return {
        add,
        remove,
        run,
        getAll: function(){
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
    task.stop();
    // TaskManager.remove(task);
}

const PAUSE_TASK = function (task) {
    task.pause();
}

const RESUME_TASK = function (task) {
    task.resume();
}


