const CODE_RUN_TIMEOUT = 500;
const WAITING_RESULR = new Set();

let worker = null;
const sendIndicatorList = function () {
    let content = {};
    let lists = ['sys_datas', 'datas'];
    for (let i = 0; i < lists.length; i++) {
        for (let j = 0; j < CMenu[lists[i]].length; j++) {
            let funcName = CMenu[lists[i]][j].name;
            content[funcName] = CMenu[lists[i]][j];
        }
    }

    worker.postMessage({ cmd: 'indicatorList', content: content });
};

const initWorker = function () {
    worker = new Worker('js/worker/worker.js');
    worker.postMessage({ cmd: 'error_class_name', content: ErrorHandlers.get() });
    sendIndicatorList();
    worker.addEventListener('message', function (e) {
        let content = e.data.content;
        switch (e.data.cmd) {
            case 'websocket_reconnect':
                sendIndicatorList();
                break;
            case 'calc_start':
                ErrorHandlers.records[content.id] = setTimeout(() => {
                    Notify.error(content.className + ' 运行超时！');
                    ErrorHandlers.add(content.className);
                    CMenu.update();
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

    CMenu.init('list_menu');

    $('#btn_new_indicator').on('click', CMenu.addAction);

    $('#btn_editor_reset').on('click', CMenu.resetIndicator);
    $('#btn_runtime_reset').on('click', function (e) {
        ErrorHandlers.clear();
        CMenu.editor.focus();
    });

    $('#btn_help').on('click', function (e) {
        window.open('http://doc.tq18.cn/ta/latest');
    });

    $('#btn_editor_run').on('click', function (e) {
        let oldName = CMenu.editing.name;
        let code = CMenu.editor.getSession().getValue().trim();
        let newName = check_code(code);
        
        if (newName) {
            if(oldName !== newName){
                // 通知webworker unregister_indicator_class
                worker.postMessage({ cmd: 'unregister_indicator_class', content: oldName });
            }
            IStore.saveDraft({
                key: CMenu.editing.key,
                name: newName,
                draft: {
                    code: code,
                }
            }).then(function (result) {
                CMenu.editing = result;
                worker.postMessage({ cmd: 'indicator', content: result });
                WAITING_RESULR.add(newName);
                if (ErrorHandlers.has(newName)) {
                    ErrorHandlers.remove(newName);
                }
            }, function (e) {
                if (e === 'ConstraintError') {
                    Notify.error('指标名称重复');
                } else {
                    Notify.error(e);
                }
            });
        } else {
            Notify.error('指标名称不能为空');
        }
        CMenu.editor.focus();
    });

    $('#edit-btn').on('click', CMenu.editIndicator);
    $('#trash-btn').on('click', CMenu.trashIndicator);
});

/**
 * 检查代码是否符合规范，并返回 function name
 * @param {} code
 */
function check_code(code) {
    let reg = /^function\s*\*\s*(\S*)\s*\(\s*C\s*\)\s*\{([\s\S]*)\}\n*$/g;
    let result = reg.exec(code);
    if (result && result[0] === result.input) {
        if (!result[2].includes('yield')) {
            Notify.error('函数中返回使用 yield 关键字!');
            return false;
        } else if (CMenu.editor) {
            let annotations = CMenu.editor.getSession().getAnnotations();
            for (let i = 0; i < annotations.length; i++) {
                if (annotations[i].type === 'error') {
                    Notify.error(annotations[i].row + ':' + annotations[i].colume + ' ' + annotations[i].text);
                    return false;
                }
            }
            return result[1];
        }
    } else {
        Notify.error('代码不符合规范!');
        return false;
    }
}