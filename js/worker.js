importScripts('websocket.js', 'utils.js', 'datamanager.js', 'tamanager.js');

// 全局对象,存储全部 Instance
const G_Instances = {};

// -------------- worker listener start --------------
const log = (m) => console.log('%c%s',  "background: #ffffb0", m);

self.addEventListener('error', function(event) {
    event.preventDefault();
    console.log('%c%s',  "background: #ffffb0; color: red;", event.error.stack)
});

self.addEventListener('message', function(event) {
    var content = event.data.content;
    switch (event.data.cmd) {
        case 'indicatorList':
            TM.sendIndicatorClassList(content);
            break;
        case 'indicator':
            TM.sendIndicatorClass(content.name, content.code);
            break;
        default:
            break;
    }
});
// -------------- worker listener end --------------

