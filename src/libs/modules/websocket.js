// event.js
class TqWebsocket extends EventTarget{
    constructor(url){
        super();
        this.url = url;
        this.ws = null;
        this.queue = [];

        // 自动重连开关
        this.reconnect = true;
        this.reconnectTask = null;
        this.reconnectInterval = 3000;

        this.STATUS = {
            CONNECTING: 0,
            OPEN: 1,
            CLOSING: 2,
            CLOSED: 3,
        };
    }

    send_json(obj) {
        if (this.ws.readyState === 1) {
            this.ws.send(JSON.stringify(obj));
        } else {
            this.queue.push(JSON.stringify(obj));
        }
    };

    isReady() {
        return this.ws.readyState === 1;
    };

    init() {
        this.ws = new WebSocket(this.url);
        var _this = this;
        this.ws.onmessage = function (message) {
            let data = eval('(' + message.data + ')');
            _this.fire({
                type: 'onmessage',
                data: data
            });
        };

        this.ws.onclose = function (event) {
            _this.fire({type: 'onclose'});

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
            _this.fire({type: 'onopen'});

            if (this.reconnectTask) {
                clearInterval(_this.reconnectTask);
                _this.fire({type: 'onreconnect'});
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