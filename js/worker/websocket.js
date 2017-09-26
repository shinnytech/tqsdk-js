var TqWebSocket = function (url, callbacks) {
    this.url = url;
    this.ws;
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
    function jsonToStr(obj) {
        return JSON.stringify(obj)
    }

    if (this.ws.readyState === 1) {
        this.ws.send(jsonToStr(obj));
    } else {
        this.queue.push(jsonToStr(obj));
    }
}

TqWebSocket.prototype.isReady = function () {
    return this.ws.readyState === 1;
}

TqWebSocket.prototype.init = function () {
    function strToJson(message) {
        return eval("(" + message + ")")
    }

    this.ws = new WebSocket(this.url);
    var this_ws = this;
    this.ws.onmessage = function (message) {
        this_ws.callbacks.onmessage(strToJson(message.data));
    };
    this.ws.onclose = function (event) {
        // 清空 datamanager
        this_ws.callbacks.onclose();
        // 清空 queue
        this_ws.queue = [];
        // 自动重连
        if (this_ws.reconnect) {
            this_ws.reconnectTask = setInterval(function () {
                if (this_ws.ws.readyState === 3) this_ws.init();
            }, this_ws.reconnectInterval);
        }
    };
    this.ws.onerror = function (error) {
        this_ws.ws.close();
    };
    this.ws.onopen = function () {
        // 请求全部数据同步
        this_ws.callbacks.onopen();
        if (this.reconnectTask) {
            clearInterval(this_ws.reconnectTask);
            this_ws.callbacks.onreconnect();
        }
        if (this_ws.queue.length > 0) {
            while (this_ws.queue.length > 0) {
                if (this_ws.ws.readyState === 1) this_ws.ws.send(this_ws.queue.shift());
                else break;
            }
        }
    };
}

const WS = new TqWebSocket('ws://tianqin.com:7777/', {
    onmessage: function (message) {
        if (message.aid == "rtn_data") {
            //收到行情数据包，更新到数据存储区
            for (var i = 0; i < message.data.length; i++) {
                var temp = message.data[i];
                DM.update_data(temp);
            }
            // 重新计算 instance
            for (var instance_id in G_Instances) {
                G_Instances[instance_id].calculate();
            }
        } else if (message.aid == "update_indicator_instance") {
            //主进程要求创建或修改指标实例
            var pack = message["set_indicator_instance"];
            if (!G_Instances[pack.instance_id]) {
                G_Instances[pack.instance_id] = new IndicatorInstance(pack);
            }
            G_Instances[pack.instance_id].resetByInstance(pack);
        } else if (message.aid == "delete_indicator_instance") {
            //主进程要求创建或修改指标实例
            var instance_id = message["instance_id"];
            if (G_Instances[instance_id]) {
                delete G_Instances[instance_id];
            }
        }
    },
    onopen: function () {
        var demo_d = {
            aid: "sync_datas",
            sync_datas: {},
        };
        WS.sendJson(demo_d);
    },
    onclose: function () {
        DM.clear_data();
    },
    onreconnect: function () {
        postMessage({cmd: 'websocket_reconnect'});
    }
});

WS.init();
