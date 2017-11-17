const CODE_RUN_TIMEOUT = 500;
const WAITING_RESULR = new Set();

let worker = null;

const initWorker = function () {
    worker = new Worker('/js/worker/worker.js');
    // worker.postMessage({ cmd: 'error_class_name', content: ErrorHandlers.get() });
    
    worker.addEventListener('message', function (e) {
        let content = e.data.content;
        switch (e.data.cmd) {
            case 'websocket_reconnect':
                break;
            case 'calc_start':
                break;
            case 'calc_end':
                break;
            case 'trade_start':
                if(onTradeStart) onTradeStart();
                break;
            case 'trade_end':
                if(onTradeEnd) onTradeEnd();
                break;
            case 'feedback':
                break;
            default:
                break;
        }
    }, false);
};

initWorker();

