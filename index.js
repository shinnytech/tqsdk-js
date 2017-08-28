$(function () {
    // //连接到主进程
    // WS.init();

    // init 指标类
    CMenu.init('list_menu');


    $('#btn_new_indicator').on('click', CMenu.addAction);

    $('#btn_editor_save').on('click', CMenu.saveDraftIndicator);
    $('#btn_editor_reset').on('click', CMenu.resetIndicator);



    $('#btn_editor_run').on('click', function(e){
        // todo: generate indicator class
        var code = CMenu.editor.getSession().getValue();
        CMenu.saveFinalIndicator();
    });

    $('#edit-btn').on('click', CMenu.editIndicator);
    $('#trash-btn').on('click', CMenu.trashIndicator);


    // 3 显示UI
    // var Indicators = _.map('name')(Indicator.Class);
    // var init_indicator_name = listMenu.init(Indicators);

    // console.log(init_indicator_name)
    // editor.setValue(localStorage.getItem(init_indicator_name));
    // listMenu.editing_indicator = init_indicator_name;

    // listMenu.on('select', function(name){
    //     editor.setValue(localStorage.getItem(name));
    //     listMenu.editing_indicator = name;
    // });

    // 4 发往主进程

    // var result = ace.edit("result");
    // result.getSession().setMode("ace/mode/json");
    // result.$blockScrolling = Infinity;




    // Rx.Observable.fromEvent(run, 'click')
    // // .throttleTime(1000)
    // // .scan(count => count + 1, 0)
    //     .subscribe(function ($event) {
    //         // var i = eval(editor.getValue())
    //         // console.log(i)
    //         // // todo: 重新求值
    //         // TM.recalc_indicators();
    //     });

    // var btn_result_clean = document.getElementById('btn_result_clean');
    // Rx.Observable.fromEvent(btn_result_clean, 'click')
    // // .throttleTime(1000)
    // // .scan(count => count + 1, 0)
    //     .subscribe(function($event){
    //         result.setValue('');
    //     });
});


