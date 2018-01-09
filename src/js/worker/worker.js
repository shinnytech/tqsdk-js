importScripts('websocket.js', 'utils.js', 'datamanager.js', 'tamanager.js', '/defaults/basefuncs.js');

// 全局对象,存储全部 Instance
const G_INSTANCES = {};
const Keys = GenerateKey();
const OrderIds = GenerateKey();
let G_ERRORS = [];

const WS = new TqWebSocket('ws://127.0.0.1:7777/', {
    onmessage: function (message) {
        if (message.aid === 'rtn_data') {
            //收到行情数据包，更新到数据存储区
            for (let i = 0; i < message.data.length; i++) {
                DM.update_data(message.data[i]);
                var klines = message.data[i].klines;
                if (klines)
                    for (let key in klines) {
                        for (let dur in klines[key]) {
                            let perfix = key + '.' + dur;

                            for (let id in G_INSTANCES) {
                                G_INSTANCES[id].setInvalidByPath(perfix);
                            }
                        }
                    }
            }

            // 重新计算 instance
            for (let id in G_INSTANCES) {
                G_INSTANCES[id].calculate();
            }
        } else if (message.aid === 'update_indicator_instance') {
            //主进程要求创建或修改指标实例
            let pack = message;
            if (!G_INSTANCES[pack.instance_id]) {
                G_INSTANCES[pack.instance_id] = new IndicatorInstance(pack);
            }

            G_INSTANCES[pack.instance_id].resetByInstance(pack);
        } else if (message.aid === 'delete_indicator_instance') {
            //主进程要求创建或修改指标实例
            let id = message.instance_id;
            if (G_INSTANCES[id]) {
                delete G_INSTANCES[id];
            }
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
        postMessage({ cmd: 'websocket_reconnect' });
    },
});

WS.init();

// -------------- worker listener start --------------
const log = (m) => console.log('%c%s', 'background: #ffffb0', m);

self.addEventListener('error', function (event) {
    event.preventDefault();
    console.log('%c%s', 'background: #ffffb0; color: red;', event.error.stack);
    postMessage({
        cmd: 'error_all', content: {
            type: event.type,
        },
    });
});

self.addEventListener('message', function (event) {
    var content = event.data.content;
    switch (event.data.cmd) {
        case 'indicatorList':
            TM.sendIndicatorClassList(content);
            break;
        case 'indicator':
            TM.sendIndicatorClass(content);
            break;
        case 'error_class_name':
            G_ERRORS = content;
            break;
        case 'unregister_indicator':
            WS.sendJson({
                aid: 'unregister_indicator_class',
                name: content,
            });
            break;
        default:
            break;
    }
});

// -------------- worker listener end --------------

