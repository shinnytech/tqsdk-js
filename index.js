$(function () {
    //初始化行情数据存储区
    DM.init(function () {});

    //初始化指标类
    TM.init();

    //连接到主进程
    WS.init();


    // ui init
    var editor = ace.edit('editor');
    editor.getSession().setMode("ace/mode/javascript");
    editor.$blockScrolling = Infinity;
    editor.getSession().on('changeMode', function () {
        editor.getSession().$worker.send("changeOptions", [{undef: true, loopfunc: true}]);
    });
    editor.getSession().setMode("ace/mode/javascript");

    // init 指标类
    var listMenu = new ComListMenu('list_menu');
    listMenu.editing_indicator = '';


    // 1 读取所有指标类
    if (localStorage.getItem('version') == null) {
        localStorage.setItem('version', '0.0.1');
        for (var i = 0; i < Indicator.SourceCode.length; i++) {
            var sc = Indicator.SourceCode[i];
            localStorage.setItem(sc.name, sc.code);
        }
    }
    // 2 生成指标类描述
    for (var item in localStorage) {
        if (item == 'version') {
            continue;
        }
        // todo: 生成指标类描述
        Indicator.Class = Indicator.SourceCode;
    }


    // 3 显示UI
    var Indicators = _.map('name')(Indicator.Class);
    var init_indicator_name = listMenu.init(Indicators);
    console.log(init_indicator_name)
    editor.setValue(localStorage.getItem(init_indicator_name));
    listMenu.editing_indicator = init_indicator_name;

    listMenu.on('select', function(name){
        editor.setValue(localStorage.getItem(name));
        listMenu.editing_indicator = name;
    });

    // 4 发往主进程

    // var result = ace.edit("result");
    // result.getSession().setMode("ace/mode/json");
    // result.$blockScrolling = Infinity;


    var button = document.getElementById('btn_editor_save');
    $('#btn_editor_save').on('click', function (e) {
        // todo: 存储编辑函数
        localStorage.setItem(listMenu.editing_indicator, editor.getValue());
        // todo: 检查代码是否有语法错误
        var annotations = editor.getSession().getAnnotations();
        console.log(annotations)
        // todo: 替换原函数
        // todo: 存档
        // todo: 重新生成指标类描述，发往主进程
    });




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


