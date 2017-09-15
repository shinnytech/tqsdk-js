

const worker = new Worker('js/worker.js');
const sendIndicatorList = function(){
    var content = {};
    CMenu.sys_datas.forEach((value) => {
        content[value.name] = value;
    });
    CMenu.datas.forEach((value) => {
        content[value.name] = value;
    });
    worker.postMessage({cmd: 'indicatorList', content: content});
}
worker.addEventListener('message', function(e) {
    switch (e.data.cmd){
        case 'websocket_reconnect':
            sendIndicatorList();
            break;
    }
}, false);


$(function () {

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
        if(result && result[0] == result.input){
            if(result[1] === func_name && result[2].includes('yield') ){
                CMenu.saveFinalIndicator();
                worker.postMessage({cmd: 'indicator', content: {name: func_name, code: code}});
            }else{
                alert('代码不符合规范！')
            }
        }else{
            alert('代码不符合规范！')
        }
    });

    $('#edit-btn').on('click', CMenu.editIndicator);
    $('#trash-btn').on('click', CMenu.trashIndicator);
});


