const CODE_RUN_TIMEOUT = 500;
var waiting_result = new Set();

var worker = null;
var sendIndicatorList = function () {
    var content = {};
    var lists = ['sys_datas', 'datas'];
    for (var i = 0; i < lists.length; i++) {
        for (var j = 0; j < CMenu[lists[i]].length; j++) {
            var func_name = CMenu[lists[i]][j].name;
            content[func_name] = CMenu[lists[i]][j];
            if (lists[i] === 'datas' && CMenu[lists[i]][j].type === 'custom_wh') {
                covertWH(CMenu[lists[i]][j], CMenu[lists[i]][j].draft.code).then(function (response) {
                    Notify.success('convert/wh  success');
                    worker.postMessage({cmd: 'indicator', content: response});
                }, function (e) {
                    if (e.errline = -1) {
                        Notify.error('convert/wh  error in the end of code \n' + e.errvalue);
                    } else {
                        Notify.error('convert/wh  line:' + e.errline + ' col:' + e.errcol + '\n' + e.errvalue);
                    }
                });
            }
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
            covertWH(CMenu.editing, code).then(function (response) {
                Notify.success('convert/wh  success');
                worker.postMessage({cmd: 'indicator', content: response});
            }, function (e) {
                if (e.errline = -1) {
                    Notify.error('convert/wh  error in the end of code \n' + e.errvalue);
                } else {
                    Notify.error('convert/wh  line:' + e.errline + ' col:' + e.errcol + '\n' + e.errvalue);
                }
            });
        } else {
            var reg = /^function\s*\*\s*(.*)\s*\(\s*C\s*\)\s*\{([\s\S]*)\}$/g;
            var result = reg.exec(code);
            if (result && result[0] == result.input) {
                if (result[1] !== func_name) {
                    Notify.error('函数名称必须和自定义指标名称相同!');
                } else if (!result[2].includes('yield')) {
                    Notify.error('函数中返回使用 yield 关键字!');
                } else {
                    CMenu.saveDraftIndicator();
                    worker.postMessage({cmd: 'indicator', content: {name: func_name, code: code}});
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

function covertWH(indicator) {
    let type = 'MAIN';
    switch (indicator.prop) {
        case "主图K线形态":
            type = 'MAIN';
            break;
        case "副图指标":
            type = 'SUB';
            break;
        case "K线附属指标":
            type = 'MAIN';
            Notify.error('未实现 K线附属指标');
            return;
            break;
    }
    let params = [];
    for (let i = 1; i <= 6; i++) {
        let p = indicator.params[i];
        if (p && p.name)
            params.push([p.name, Number(p.min), Number(p.max), Number(p.default_value)]);
    }
    var req = {
        id: indicator.name, //指标函数名
        cname: indicator.name, //指标中文名称
        type: type, //指标类型, MAIN=主图指标, SUB=副图指标
        params: params,
        src: indicator.draft.code //文华原代码
    }
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'post',
            url: 'http://192.168.1.80:8000/convert/wh',
            data: JSON.stringify(req)
        }).then(function (response) {
            if (response.errline === 0) {
                resolve({name: indicator.name, code: response.target});
            } else {
                reject(response);
            }
        }, function (e) {
            console.error(e);
            reject(e);
        });
    });
}


