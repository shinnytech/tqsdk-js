var result_editor = null;
$(function () {
    // 初始化代码编辑区域
    var editor = ace.edit('editor');
    editor.getSession().setMode('ace/mode/text');
    editor.getSession().setOption('useWorker', false);
     result_editor = ace.edit('result-editor');
    ace.require('ace/ext/language_tools');
    result_editor.getSession().setMode('ace/mode/javascript');
    result_editor.$blockScrolling = Infinity;
    result_editor.setReadOnly(true);
    // 参数区域
    $('div.left-menu a.indicator-prop').on('click', function (e) {
        $('div.left-menu button>span.show-prop').text(this.innerText);
    });
    $('div.left-menu table.wh-param-list').find('input').on('click', function (e) {
        $(this).attr('readonly', false);
    });

    $('button#translate').on('click', function (e) {
        $('#tianqin #translate-status').attr('class', 'panel-heading').text('翻译中......');
        $('#tianqin').attr('class', 'panel panel-info');
        var code = editor.getValue();
        var result = covertWHRequest(code)
            .then(response => response.json())
            .then(data => {
                if (data.errline === 0) {
                    $('#tianqin #translate-status').text('翻译完成');
                    $('#tianqin').attr('class', 'panel panel-success');
                    result_editor.getSession().setValue(data.target, 1);
                } else {
                    result_editor.getSession().setValue('', 1);
                    // var err = `error in ${data.errline}:${data.errcol} \n ${data.errvalue}`;
                    $('#tianqin #translate-status').text('错误：' + data.errvalue).show();
                    $('#tianqin').attr('class', 'panel panel-danger');
                }
            })
            .catch(error => {
                console.error(error.message)
            });
    });
});

function covertWHRequest(code) {
    let indicator_name = $('input#indicator-name').val();
    var request_body = {
        id: indicator_name, //指标函数名
        cname: indicator_name, //指标中文名称
        type: null, //指标类型, MAIN=主图指标, SUB=副图指标
        params: [],
        src: code, //文华原代码
    };

    // type
    let map_indicator_prop_to_type = {
        'K线附属指标': 'MAIN',
        '副图指标': 'SUB'
    }
    let prop = $('div.left-menu button>span.show-prop').text();
    request_body.type = map_indicator_prop_to_type[prop];

    // params
    let $trs = $('div.left-menu table.wh-param-list tbody tr');
    for (let i = 1; i <= 6; i++) {
        let name = $trs.find('.name_' + i).val().trim();
        if (name) {
            let max = $trs.find('.max_' + i).val();
            let min = $trs.find('.min_' + i).val();
            let defaultValue = $trs.find('.default_' + i).val();
            request_body.params.push([name, Number(min), Number(max), Number(defaultValue)]);
        }
    }

    return fetch('http://tools.tq18.cn/convert/wh', {
        method: 'POST',
        body: JSON.stringify(request_body),
    })
}