const CODE_RUN_TIMEOUT = 500;
const waiting_result = new Set();

var worker = null;
var sendIndicatorList = function () {
    var content = {};
    var lists = ['sys_datas', 'datas'];
    for (var i = 0; i < lists.length; i++) {
        for (var j = 0; j < CMenu[lists[i]].length; j++) {
            var func_name = CMenu[lists[i]][j].name;
            content[func_name] = CMenu[lists[i]][j];
        }
    }
    worker.postMessage({cmd: 'indicatorList', content: content});
}


var initWorker = function () {
    worker = new Worker('js/worker/worker.js');
    worker.postMessage({cmd: 'error_class_name', content: ErrorHandlers.get()});
    sendIndicatorList();
    worker.addEventListener('message', function (e) {
        var content = e.data.content;
        switch (e.data.cmd) {
            case 'websocket_reconnect':
                sendIndicatorList();
                break;
            case 'calc_start':
                ErrorHandlers.records[content.id] = setTimeout(() => {
                    ErrorHandlers.add(content.className);
                    CMenu.updateUI();
                    worker.terminate();
                    initWorker();
                }, CODE_RUN_TIMEOUT);
                break;
            case 'calc_end':
                clearTimeout(ErrorHandlers.records[content.id]);
                break;
            case 'feedback':
                if (content.error) {
                    Notify.error((new TqFeedback(content)).toString());
                    ErrorHandlers.add(content.func_name);
                    if (content.type === 'run' || content.type === 'define') {
                        worker.terminate();
                        initWorker();
                    }
                } else {
                    Notify.success((new TqFeedback(content)).toString());
                    // 定义成功之后更新 Final
                    if (content.type === 'define' && waiting_result.has(content.func_name)) {
                        waiting_result.delete(content.func_name);
                        ErrorHandlers.remove(content.func_name);
                        CMenu.saveFinalIndicator(content.func_name);
                    }
                }
                break;
            default:
                break;
        }
    }, false);
}

initWorker();

$(function () {

    CMenu.init('list_menu');

    $('#btn_new_indicator').on('click', CMenu.addAction);

    $('#btn_editor_reset').on('click', CMenu.resetIndicator);
    $('#btn_runtime_reset').on('click', function (e) {
        ErrorHandlers.clear();
    });

    $('#btn_editor_run').on('click', function (e) {
        // todo: generate indicator class
        var func_name = CMenu.editing.name;
        var code = CMenu.editor.getSession().getValue();
        code = code.trim();
        if (CMenu.editing.type === 'custom_wh') {
            CMenu.saveDraftIndicator();
            waiting_result.add(func_name);
            worker.postMessage({cmd: 'indicator', content: CMenu.editing});
        } else {
            var reg = /^function\s*\*\s*(.*)\s*\(\s*C\s*\)\s*\{([\s\S]*)\}$/g;
            var result = reg.exec(code);
            if (result && result[0] == result.input) {
                if (result[1] !== func_name) {
                    Notify.error('函数名称必须和自定义指标名称相同!');
                } else if (!result[2].includes('yield')) {
                    Notify.error('函数中返回使用 yield 关键字!');
                } else {
                    var annotations = CMenu.editor.getSession().getAnnotations();
                    for (let i = 0; i < annotations.length; i++) {
                        if (annotations[i].type == 'error') {
                            Notify.error(annotations[i].row + ':' + annotations[i].colume + ' ' + annotations[i].text);
                            return;
                        }
                    }
                    CMenu.saveDraftIndicator();
                    worker.postMessage({cmd: 'indicator', content: CMenu.editing});
                    waiting_result.add(func_name);
                    if (ErrorHandlers.has(func_name)) {
                        ErrorHandlers.remove(func_name);
                        worker.postMessage({cmd: 'error_class_name', content: ErrorHandlers.get()});
                    }
                }
            } else {
                Notify.error('代码不符合规范!');
            }
        }
    });

    $('#edit-btn').on('click', CMenu.editIndicator);
    $('#trash-btn').on('click', CMenu.trashIndicator);
});
