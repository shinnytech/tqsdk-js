importScripts('websocket.js', 'utils.js', 'datamanager.js', 'tamanager.js', '/defaults/basefuncs.js');

// 全局对象,存储全部 Instance
const G_Instances = {};
const Keys = GenerateKey();
let G_Error_Class_Name = [];


// -------------- worker listener start --------------
const log = (m) => console.log('%c%s',  "background: #ffffb0", m);

self.addEventListener('error', function(event) {
    event.preventDefault();
    console.log('%c%s',  "background: #ffffb0; color: red;", event.error.stack);
    postMessage({
        cmd: 'error_all', content: {
            type: event.type
        }
    });
});

self.addEventListener('message', function(event) {
    var content = event.data.content;
    // console.log(event.data)
    switch (event.data.cmd) {
        case 'indicatorList':
            TM.sendIndicatorClassList(content);
            break;
        case 'indicator':
            TM.sendIndicatorClass(content);
            break;
        case 'error_class_name':
            G_Error_Class_Name = content;
            break;
        case 'unregister_indicator':
            WS.sendJson({
                aid: 'unregister_indicator_class',
                name: content
            });
            break;
        default:
            break;
    }
});

// -------------- worker listener end --------------


