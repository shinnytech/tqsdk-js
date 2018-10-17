const CONVERT_WH_URL = 'http://tools.tq18.cn/convert/wh';
// const CONVERT_WH_URL = 'http://192.168.1.80:8000/convert/wh';

$(function () {
    // 初始化代码编辑区域
    var editor = ace.edit('editor');
    editor.getSession().setMode('ace/mode/text');
    var result_editor = ace.edit('result-editor');
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
    $('input#indicator-name').on('input', checkIndName);

    $('button#translate').on('click', function (e) {
        if(!checkIndName()) return;
        $('#tianqin #translate-status').attr('class', 'panel-heading').text('翻译中......');
        $('#tianqin').attr('class', 'panel panel-info');
        let name = $('input#indicator-name').val();
        let code = editor.getValue();
        let result = covertWHRequest(name, code)
            .then(response => response.json())
            .then(data => {
                if (data.errors.length === 0){
                    result_editor.getSession().setValue(data.code, 1);
                    $('#tianqin #translate-status').text('翻译完成');
                    $('#tianqin').attr('class', 'panel panel-success');
                } else {
                    let annotations = [];
                    let err_str = '';
                    for (let err of data.errors){
                        annotations.push({
                            row: err.line - 1,
                            column: err.col - 1,
                            text: err.msg,
                            type: 'error'
                        });
                        err_str += '( ' + err.line + ':' + err.col + ' ) ';
                        err_str += err.msg + '\n';
                    }
                    editor.getSession().setAnnotations(annotations);
                    result_editor.getSession().setValue(data.code, 1);
                    $('#tianqin #translate-status').text(err_str).show();
                    $('#tianqin').attr('class', 'panel panel-danger');
                }
            })
            .catch(error => {
                console.error(error)
            });
    });
});

const checkIndName = (function(){
    let status = true;
    return function(){
        let name = $('input#indicator-name').val();
        let new_status = checkVariableName(name);
        if (status !== new_status){
            status = new_status;
            if (status){
                $('#ind-name #ind-name-status').attr('class', 'panel-heading hide');
                $('#ind-name').attr('class', 'panel panel-default');
                $('button#translate').attr('disabled', false);
                $('#ind-name .panel-body').attr('class', 'panel-body');
                return true;
            } else {
                $('#ind-name #ind-name-status').attr('class', 'panel-heading');
                $('#ind-name').attr('class', 'panel panel-danger');
                $('button#translate').attr('disabled', true);
                $('#ind-name .panel-body').attr('class', 'panel-body has-error');
                return false;
            }
        } else return status;
    }
}());

const checkVariableName = function(name) {
    // 匹配变量名的正则
    // 长度1-20，数字、字母、_、$ 组成，数字不能开头
    let regExp = /^[a-zA-Z\_\$][0-9a-zA-Z\_\$]{0,19}$/;
    return regExp.test(name);
}

function covertWHRequest(ind_name, code) {
    var request_body = {
        id: ind_name, //指标函数名
        cname: ind_name, //指标中文名称
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
    return fetch(CONVERT_WH_URL, {
        method: 'POST',
        body: JSON.stringify(request_body),
    });
}
