
// 全局对象,存储全部 Instance
let G_Instances = {};

$(function () {

    //连接到主进程
    WS.init();

    $('#btn_new_indicator').on('click', CMenu.addAction);
    $('#btn_editor_save').on('click', CMenu.saveDraftIndicator);
    $('#btn_editor_reset').on('click', CMenu.resetIndicator);

    $('#btn_editor_run').on('click', function (e) {
        // todo: generate indicator class
        var code = CMenu.editor.getSession().getValue();
        CMenu.saveFinalIndicator();
        var func_name = CMenu.editing.name;
        func_code = code;
        try{
            eval(func_name + ' = ' + code);
        }catch (e){
            alert('error: ' + e.message);
            return;
        }
        var func = window[func_name];
        TM.update_class_define(func);
    });

    $('#edit-btn').on('click', CMenu.editIndicator);
    $('#trash-btn').on('click', CMenu.trashIndicator);
});


