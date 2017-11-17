const CODE_RUN_TIMEOUT = 500;
const WAITING_RESULR = new Set();

let worker = null;

const initWorker = function () {
    worker = new Worker('js/worker/worker.js');
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
                console.log('trade_start');
                break;
            case 'trade_end':
                console.log('trade_end');
                break;
            case 'feedback':
                if (content.error) {
                    Notify.error((new TqFeedback(content)).toString());
                    ErrorHandlers.add(content.func_name);
                    CMenu.update();
                    if (content.type === 'run' || content.type === 'define') {
                        worker.terminate();
                        initWorker();
                    }
                } else {
                    if (content.type === 'define' && WAITING_RESULR.has(content.func_name)) {
                        Notify.success((new TqFeedback(content)).toString());
                        WAITING_RESULR.delete(content.func_name);
                        ErrorHandlers.remove(content.func_name);

                        // 定义成功之后更新 Final
                        CMenu.saveFinalIndicator(content.func_name);
                    }
                }

                break;
            default:
                break;
        }
    }, false);
};

initWorker();

$(function () {
    TraderUI.init()

    $('#make-orker').on('click', function(e){
        var target = e.target;
        if(target.nodeName === 'BUTTON'){
            var [direction, offset] = target.id.split('-');
            var exchange_id = "SHFE";
            var instrument_id = $('#instrument_id').val();
            var volume = $('#volume').val();
            volume = parseInt(volume);
            var limit_price = $('#limit_price').val();
            limit_price = Number(limit_price)
            
            var order_prarams = 

            worker.postMessage({ cmd: 'trader', content: {
                name: 'trade_func',
                code: trade_func.toString(),
                params: {
                    exchange_id, instrument_id, volume, limit_price, direction, offset
                }
            } });
        }
    })

    
});
