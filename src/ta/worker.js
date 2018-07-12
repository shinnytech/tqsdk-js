// del:start
importScripts('../libs/modules/utils.js');
importScripts('../libs/modules/color.js');
importScripts('../libs/modules/event.js');
importScripts('../libs/modules/publicdata.js');
importScripts('../libs/modules/datamanager.js');
importScripts('../libs/modules/indDefineCtx.js');
importScripts('../libs/modules/indRunCtx.js');
importScripts('../libs/modules/tamanager.js');
importScripts('../libs/modules/taskmanager.js');
importScripts('../libs/modules/websocket.js');
// del:end
importScripts('../libs/func/basefuncs.js');
importScripts('../libs/tqsdk.js');

let TQ = null;
let G_ERRORS = [];

// -------------- worker listener start --------------
const log = (m) => console.log('%c%s', 'background: #ffffb0', m);

self.addEventListener('error', function (event) {
    event.preventDefault();
    console.log('%c%s', 'background: #ffffb0; color: red;', event.error.stack);
    postMessage({
        cmd: 'error_all', content: {
            type: event.type,
            message: event.error.stack
        }
    });
});

self.addEventListener('message', function (event) {
    var content = event.data.content;
    switch (event.data.cmd) {
        case 'start':
            TQ = new TQSDK(content.url);
            TQ.register_ws_processor('onreconnect', function(){
                postMessage({ cmd: 'websocket_reconnect' });
            });
            TQ.register_ws_processor('onopen', function(){
                postMessage({ cmd: 'websocket_open' });
            });
            break;
        case 'register_indicator_class':
            try {
                importScripts(content.path);
                TQ.REGISTER_INDICATOR_CLASS(self[content.name]);
            } catch (e) {
                console.log(e)
                postMessage({
                    cmd: 'feedback', content: {
                        error: true,
                        type: 'define',
                        message: e.message,
                        func_name: content.name,
                    },
                });
            }
            postMessage({
                cmd: 'feedback', content: {
                    error: false,
                    type: 'define',
                    message: 'success',
                    func_name: content.name,
                },
            });
            break;
        case 'unregister_indicator_class':
            TQ.UNREGISTER_INDICATOR_CLASS(content);
            break;
        case 'error_class_name':
            G_ERRORS = content;
            break;
        default:
            break;
    }
});
