
const CODE_RUN_TIMEOUT = 50;



var worker = null;
var sendIndicatorList = function () {
    var content = {};
    var lists = ['sys_datas', 'datas'];
    for (var i = 0; i < lists.length; i++) {
        for (var j = 0; j < CMenu[lists[i]].length; j++) {
            content[CMenu[lists[i]][j].name] = CMenu[lists[i]][j];
        }
    }
    worker.postMessage({cmd: 'indicatorList', content: content});
}

var ErrorsFunction = {};
var initWorker = function(){
    worker = new Worker('js/worker/worker.js');
    worker.postMessage({cmd: 'error_class_name', content: localStorage.getItem('error_class_name')});
    sendIndicatorList();
    worker.addEventListener('message', function (e) {
        switch (e.data.cmd) {
            case 'websocket_reconnect':
                sendIndicatorList();
                break;
            case 'calc_start':
                var {id, className} = e.data.content;
                ErrorsFunction[id] = setTimeout(()=>{
                    console.log(id, className, '执行时间超过 ' + CODE_RUN_TIMEOUT + ' ms');
                    var list = [];
                    if(localStorage.key('error_class_name')){
                        list = localStorage.getItem('error_class_name').split(',');
                    }
                    if(list.indexOf(className) == -1){
                        list.push(className);
                    }
                    localStorage.setItem('error_class_name', list.join(','));
                    CMenu.updateUI();
                    worker.terminate();
                    initWorker();
                }, CODE_RUN_TIMEOUT);
                break;

            case 'calc_end':
                var {id, className} = e.data.content;
                clearTimeout(ErrorsFunction[id]);
                break;
        }
    }, false);
}

initWorker();

$(function () {
    // 初始化 tooltip
    $('[data-toggle="tooltip"]').tooltip();

    CMenu.init('list_menu');

    $('#btn_new_indicator').on('click', CMenu.addAction);
    $('#btn_editor_save').on('click', CMenu.saveDraftIndicator);
    $('#btn_editor_reset').on('click', CMenu.resetIndicator);

    $('#btn_editor_run').on('click', function (e) {
        // todo: generate indicator class
        var func_name = CMenu.editing.name;
        var code = CMenu.editor.getSession().getValue();
        code = code.trim();
        var reg = /^function\s*\*\s*(.*)\s*\(\s*C\s*\)\s*\{([\s\S]*)\}$/g;
        var result = reg.exec(code);
        if (result && result[0] == result.input) {
            if(result[1] !== func_name){
                $.notify('函数名称必须和自定义指标名称相同!', "error");
            }else if(!result[2].includes('yield')){
                $.notify('函数中返回使用 yield 关键字!', "error");
            }else{
                CMenu.saveFinalIndicator();
                worker.postMessage({cmd: 'indicator', content: {name: func_name, code: code}});
                var list = localStorage.getItem('error_class_name').split(',');
                if(list.indexOf(func_name) > -1){
                    list.splice(list.indexOf(func_name), 1);
                    localStorage.setItem('error_class_name', list);
                    worker.postMessage({cmd: 'error_class_name', content: localStorage.getItem('error_class_name')});
                }
            }
        } else {
            $.notify('代码不符合规范!', "error");
        }
    });

    $('#edit-btn').on('click', CMenu.editIndicator);
    $('#trash-btn').on('click', CMenu.trashIndicator);
});


