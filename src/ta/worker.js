// del:start
importScripts('../libs/modules/color.js');
// del:end
importScripts('../libs/func/basefuncs.js');
importScripts('../libs/tqsdk.js');

const TQ = new TQSDK();

TQ.register_ws_processor('onreconnect', function(){
    postMessage({ cmd: 'websocket_reconnect' });
});

TQ.register_ws_processor('onopen', function(){
    postMessage({ cmd: 'websocket_open' });
});

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
