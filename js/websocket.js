(function () {
    var isDebug = 0;

    var ws;
    var server_url = 'ws://127.0.0.1:7777/';
    var queue = [];

    var req_id = 0;

    // 自动重连开关
    var reconnect = true;
    var reconnectTask;
    var reconnectInterval = 3000;

    var CONNECTING = 0;
    var OPEN = 1;
    var CLOSING = 2;
    var CLOSED = 3;

    function init() {
        reconnect = true;
        ws = new WebSocket(server_url);
        ws.onmessage = function (message) {
            var decoded = JSON.parse(message.data, function (key, value) {
                return value === "NaN" ? NaN : value;
            });
            if (decoded.aid == "rtn_data") {
                //收到行情数据包，更新到数据存储区
                for (var i = 0; i < decoded.data.length; i++) {
                    var temp = decoded.data[i];
                    if( i == decoded.data.length - 1){
                        DM.update_data(temp);
                    }else{
                        DM.update_data(temp);
                    }
                }
            } else if (decoded.aid == "set_indicator_instance") {
                //主进程要求创建或修改指标实例
                TM.set_indicator_instance(decoded["set_indicator_instance"]);
            }
        };
        ws.onclose = function (event) {
            console.info('websocket closed');
            // 清空 datamanager
            DM.clear_data();
            // 清空 queue
            queue = [];
            // 自动重连
            if (reconnect) {
                reconnectTask = setInterval(function () {
                    if (ws.readyState === CLOSED) init();
                }, reconnectInterval);
            }
        };
        ws.onerror = function (error) {
            console.error('error', JSON.stringify(error));
            ws.close();
        };
        ws.onopen = function () {
            console.info('websocket open');
            // 请求全部数据同步
            var demo_d = {
                aid: "sync_datas",
                sync_datas: {},
            };
            ws.send(JSON.stringify(demo_d));
            if (reconnectTask) {
                clearInterval(reconnectTask);
                TM.init();
            }
            if (queue.length > 0) {
                while (queue.length > 0) {
                    if (isReady()) send(queue.shift());
                    else break;
                }
            }
        };
    }

    function isReady() {
        if (typeof ws === 'undefined') return false;
        else return ws.readyState === OPEN;
    }

    function send(obj) {
        if (isReady()) {
            ws.send(JSON.stringify(obj));
        } else  {
            queue.push(obj);
        }
    }

    this.WS = {
        init: init,
        sendJson: send
    }
}());