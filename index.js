$(function () {
    // init 指标类
    CMenu.init('list_menu');

    $('#btn_new_indicator').on('click', CMenu.addAction);
    $('#btn_editor_save').on('click', CMenu.saveDraftIndicator);
    $('#btn_editor_reset').on('click', CMenu.resetIndicator);

    $('#btn_editor_run').on('click', function (e) {
        // todo: generate indicator class
        var code = CMenu.editor.getSession().getValue();
        CMenu.saveFinalIndicator();
        var func_name = CMenu.editing.name;
        func_code = func_name + "= function(C){" + code + "};";
        eval(func_code);
        var func = window[func_name];
        TM.update_class_define(func);
    });

    $('#edit-btn').on('click', CMenu.editIndicator);
    $('#trash-btn').on('click', CMenu.trashIndicator);

    //连接到主进程
    WS.init();
});