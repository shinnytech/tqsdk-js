var TqWebSocket = function (url, callbacks) {
    this.url = url;
    this.ws ;
    this.queue = [];
    // 自动重连开关
    this.reconnect = true;
    this.reconnectTask;
    this.reconnectInterval = 3000;
    this.callbacks = callbacks;
}

TqWebSocket.prototype.STATUS = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
}
TqWebSocket.prototype.sendJson = function (obj) {
    if (this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(obj));
    } else {
        this.queue.push(obj);
    }
}
TqWebSocket.prototype.sendString = function (str) {
    if (this.ws.readyState === 1) {
        this.ws.send(str);
    } else {
        this.queue.push(obj);
    }
}
TqWebSocket.prototype.init = function () {
    this.ws = new WebSocket(this.url);
    var this_ws = this;
    this.ws.onmessage = function (message) {
        this_ws.callbacks.onmessage(message);
    };
    this.ws.onclose = function (event) {
        // 清空 datamanager
        this_ws.callbacks.onmessage();
        // 清空 queue
        this_ws.queue = [];
        // 自动重连
        if (this_ws.reconnect) {
            this_ws.reconnectTask = setInterval(function () {
                if (this_ws.ws.readyState === this_ws.STATUS.CLOSED) this_ws.init();
            }, this_ws.reconnectInterval);
        }
    };
    this.ws.onerror = function (error) {
        console.error('error', JSON.stringify(error));
        this_ws.ws.close();
    };
    this.ws.onopen = function () {
        console.info('websocket open');
        // 请求全部数据同步
        this_ws.callbacks.onopen();
        if (this.reconnectTask) {
            clearInterval(this_ws.reconnectTask);
            this_ws.callbacks.onreconnect();
        }
        if (this_ws.queue.length > 0) {
            while (this_ws.queue.length > 0) {
                if (this_ws.isReady()) this_ws.ws.send(this_ws.queue.shift());
                else break;
            }
        }
    };
}

var WS = new TqWebSocket('ws://127.0.0.1:7777/',{
    onmessage: function (message) {
        // var decoded = JSON.parse(message.data, function (key, value) {
        //     return value === "NaN" ? NaN : value;
        // });
        var decoded = eval("(" + message.data + ")");
        if (decoded.aid == "rtn_data") {
            //收到行情数据包，更新到数据存储区
            for (var i = 0; i < decoded.data.length; i++) {
                var temp = decoded.data[i];
                if (i == decoded.data.length - 1) {
                    DM.update_data(temp);
                } else {
                    DM.update_data(temp);
                }
            }
        } else if (decoded.aid == "set_indicator_instance") {
            //主进程要求创建或修改指标实例
            var pack = decoded["set_indicator_instance"];
            DM.reset_indicator_instance(pack);
            TM.set_indicator_instance(pack);
        }
    },
    onopen: function () {
        var demo_d = {
            aid: "sync_datas",
            sync_datas: {},
        };
        WS.sendJson(JSON.stringify(demo_d));
        // init 指标类
        if(!CMenu.container){
            CMenu.init('list_menu');
        }
    },
    onclose: function () {
        DM.clear_data();
    },
    onreconnect: function () {
        TM.init();
    }
});
