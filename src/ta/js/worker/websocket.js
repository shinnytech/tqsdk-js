const TqWebSocket = function (url, callbacks) {
    this.url = url;
    this.ws = null;
    this.queue = [];

    // 自动重连开关
    this.reconnect = true;
    this.reconnectTask = null;
    this.reconnectInterval = 3000;
    this.callbacks = callbacks;
};

TqWebSocket.prototype.STATUS = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
};

TqWebSocket.prototype.SEND_MESSAGE = TqWebSocket.prototype.sendJson = function (obj) {
    function jsonToStr(obj) {
        return JSON.stringify(obj);
    }

    if (this.ws.readyState === 1) {
        this.ws.send(jsonToStr(obj));
    } else {
        this.queue.push(jsonToStr(obj));
    }
};

TqWebSocket.prototype.isReady = function () {
    return this.ws.readyState === 1;
};

TqWebSocket.prototype.init = function () {
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


