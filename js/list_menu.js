var CMenu;
CMenu = function () {
    return {
        container: null,
        sys_dom: null,
        dom: null,
        editor: null,

        // 指标数据存储
        sys_datas: [],
        datas: [],

        // 左侧指标节点
        sys_item_doms: [],
        item_doms: {},

        // 编辑、删除对话框
        editModal: null,
        trashModal: null,

        // info panel && // param panel
        attach_container: null,
        attach_info: {},
        attach_param: {},
        attach_btns: {},

        editing: {},
        doing: '', // edit / new / copy
    }
}();

CMenu.init = function (div_id) {
    // 初始化对象
    CMenu.container = $('table#' + div_id);
    CMenu.sys_dom = CMenu.container.find('#system-indicators');
    CMenu.sys_dom.append($('<div><img width="40" height="40" src="/img/loading.svg"></img></div>'));
    CMenu.dom = CMenu.container.find('#custom-indicators');
    CMenu.dom.append($('<div><img width="40" height="40" src="/img/loading.svg"></img></div>'));

    // 附加信息区域
    CMenu.initAttachUI();

    // 初始化系统指标
    // 初始化时默认选中第一个系统指标
    var promise_sys = CMenu.initSysIndicators();

    // 初始化用户自定义指标
    CMenu.editModal = $('#EditModal');
    CMenu.trashModal = $('#TrashModal');
    var promise_cus = CMenu.initCustomIndicators();

    Promise.all([promise_cus, promise_sys]).then(function () {
        //初始化指标类
        TM.init();
    });

    // 初始化代码编辑区域
    CMenu.editor = ace.edit('editor');
    CMenu.editor.$blockScrolling = Infinity;
    CMenu.editor.getSession().on('changeMode', function () {
        CMenu.editor.getSession().$worker.send("changeOptions", [{loopfunc: true}]);
    });
    CMenu.editor.getSession().setMode("ace/mode/javascript");
    CMenu.editor.commands.addCommand({
        name: 'save',
        bindKey: {win: 'Ctrl-S', mac: 'Command-S', sender: 'editor|cli'},
        exec: function (editor) {
            $('#btn_editor_save').click();
        },
        readOnly: false
    });
    CMenu.editor.commands.addCommand({
        name: 'saveandrun',
        bindKey: {win: 'Ctrl-Shift-S', mac: 'Command-Shift-S', sender: 'editor|cli'},
        exec: function (editor) {
            $('#btn_editor_run').click();
        },
        readOnly: false
    });
}


// editor.commands.addCommand({
//     name: 'myCommand',
//     bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
//     exec: function(editor) {
//         //...
//     },
//     readOnly: true // false if this command should not apply in readOnly mode
// });

CMenu.selectCallback = function (tr, data) {
    for (var k in CMenu.sys_item_doms) {
        CMenu.sys_item_doms[k][0].classList.remove('active');
    }
    for (var k in CMenu.item_doms) {
        CMenu.item_doms[k][0].classList.remove('active');
    }
    tr.classList.add('active');
    if (data.type == 'system') {
        $('#btn_editor_save').attr('disabled', true);
        $('#btn_editor_run').attr('disabled', true);
        $('#btn_editor_reset').attr('disabled', true);
        CMenu.editing = data;
        CMenu.editor.setValue(data.draft.code, 1);
        CMenu.editor.setReadOnly(true);
        CMenu.updateAttachUI();
    } else {
        $('#btn_editor_save').attr('disabled', false);
        $('#btn_editor_run').attr('disabled', false);
        $('#btn_editor_reset').attr('disabled', false);
        IStore.getByKey(data.key).then(function (result) {
            CMenu.editing = result;
            CMenu.editor.setValue(result.draft.code, 1);
            CMenu.editor.setReadOnly(false);
            console.log(CMenu.editing)
            CMenu.updateAttachUI();
        });
    }

    if (data.type == 'system' || data.type == 'custom') {
        var center = $('div.main-container div.content-container')[0];
        center.classList.remove('col-xs-6');
        center.classList.add('col-xs-9');
        $('div.main-container div.right-menu')[0].classList.add('hide');
    } else if (data.type == 'custom_wh') {
        var center = $('div.main-container div.content-container')[0];
        center.classList.remove('col-xs-9');
        center.classList.add('col-xs-6');
        $('div.main-container div.right-menu')[0].classList.remove('hide');
    }
}

CMenu.initAttachUI = function () {
    CMenu.attach_container = $('div#attachment-container');
    // attach_info start
    CMenu.attach_info = {
        dom: $('<div class="panel panel-default"></div>').append($('<div class="panel-heading">基本信息</div>')),
    };

    var info_table = $(`<table class="table">
                 <tbody>
                    <tr>
                        <th width="48px">名称:</th>
                        <td class="name"></td>
                    </tr>
                    <tr>
                        <th>类型:</th>
                        <td class="type"></td>
                    </tr>
                    <tr>
                        <th>描述:</th>
                        <td class="memo"></td>
                    </tr>
                    <tr class="prop">
                        <th>属性:</th>
                        <td class="prop">
                             <!-- Single button -->
                            <div class="btn-group btn-group-justified"  role="group">
                                <div class="btn-group">
                                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" 
                                        aria-haspopup="true" aria-expanded="false">
                                    <span class="show-prop">主图K线形态</span> <span class="caret"></span>
                                    </button>
                                      <ul class="dropdown-menu">
                                        <li><a href="#" class="indicator-prop">副图指标</a></li>
                                        <li><a href="#" class="indicator-prop">主图K线形态</a></li>
                                        <li><a href="#" class="indicator-prop">K线附属指标</a></li>
                                      </ul>
                                </div>
                            </div>
                        </td>
                    </tr>
                 </tbody>
                </table>`);
    info_table.find('.indicator-prop').on('click', function (e) {
        info_table.find('button>span.show-prop').text(this.innerText);
    });
    CMenu.attach_info.dom.append(info_table);

    // param_dom start
    CMenu.attach_param = {
        dom: $('<div class="panel panel-default"></div>').append($('<div class="panel-heading">参数列表</div>')),
    };
    var param_table = $('<table class="table table-bordered wh-param-list"></table>');
    var param_thead = $(`<thead>
                        <tr>
                            <th>参数</th>
                            <th>名称</th>
                            <th>最大</th>
                            <th>最小</th>
                            <th>缺省</th>
                        </tr>
                        </thead>`);
    var param_tbody = $('<tbody></tbody>');
    for (var i = 1; i <= 6; i++) {
        var tr = $('<tr></tr>');
        var td_id = $('<td>' + i + '</td>');
        var td_name = $('<td><input type="text" readonly class="form-control ' + ('name_' + i) + '"/></td>');
        var td_max = $('<td><input type="number" readonly class="form-control ' + ('max_' + i) + '"/></td>');
        var td_min = $('<td><input type="number" readonly class="form-control ' + ('min_' + i) + '"/></td>');
        var td_default = $('<td><input type="number" readonly class="form-control ' + ('default_' + i) + '"/></td>');
        tr.append(td_id).append(td_name).append(td_max).append(td_min).append(td_default);
        param_tbody.append(tr);
    }
    param_tbody.find('input').on('click', function (e) {
        $(this).attr('readonly', false);
    })
    param_table.append(param_thead).append(param_tbody);
    CMenu.attach_param.dom.append(param_table);

    CMenu.attach_container.append(CMenu.attach_info.dom).append(CMenu.attach_param.dom);
}

CMenu.updateAttachUI = function () {
    var indicator = CMenu.editing;
    var type_str = {
        system: '天勤脚本语言',
        custom: '天勤脚本语言',
        custom_wh: '文华脚本语言',
    }
    if (indicator.type == "custom_wh") {
        CMenu.attach_info.dom.find('.name').text(indicator.name);
        CMenu.attach_info.dom.find('.type').text(type_str[indicator.type]);
        CMenu.attach_info.dom.find('td span.show-prop').text(indicator.prop);
        var trs = CMenu.attach_param.dom.find('tbody tr');
        for (var i = 1; i <= 6; i++) {
            trs.find('.name_' + i).val(indicator.params[i].name);
            trs.find('.max_' + i).val(indicator.params[i].max);
            trs.find('.min_' + i).val(indicator.params[i].min);
            trs.find('.default_' + i).val(indicator.params[i].default_value);
        }
    }
}


CMenu.initSysIndicators = function () {
    return new Promise((resolve, reject) => {
        $.get('/defaults/defaults.json').then(function (response) {
            var all_promises = [];
            for (var i = 0; i < response.length; i++) {
                all_promises.push(function (name) {
                    return $.ajax({
                        url: '/defaults/' + name + '.js',
                        dataType: "text"
                    }).then(function (response) {
                        var item = {
                            // key: name,
                            name: name,
                            type: 'system',
                            draft: {
                                code: response
                            }
                        };
                        CMenu.sys_datas.push(item);
                    });
                }(response[i]));
            }
            Promise.all(all_promises).then(function () {
                CMenu.sys_dom.empty();
                for (var i = 0; i < CMenu.sys_datas.length; i++) {
                    var tr = CMenu_Utils.getIndicatorTr(CMenu.sys_datas[i], {
                        select: CMenu.selectCallback,
                        copy: CMenu.copyCallback
                    });
                    CMenu.sys_item_doms.push(tr);
                    CMenu.sys_dom.append(tr);
                }
                // 初始化时默认选中第一个系统指标
                CMenu.sys_item_doms[0].find('td:first').click();
                resolve();
            });
        });
    });

}

CMenu.initCustomIndicators = function () {
    return new Promise((resolve, reject) => {
        IStore.init().then(function (s) {
            IStore.getAll().then(function (list) {
                // 显示UI
                CMenu.datas = list;
                CMenu.dom.empty();
                CMenu.updateUI();
                resolve();
            }, function (e) {
                console.log(e);
            });
        });
    });

}


CMenu.addAction = function () {
    CMenu.doing = 'new';
    CMenu.editModal.find('#indicator-name').val('');
    CMenu.editModal.find("#indicator-type-tq").show();
    CMenu.editModal.find("#indicator-type-wh").show();
    CMenu.editModal.find("input[name='indicator-type']").eq('0').click();
    CMenu.editModal.modal('show');
}

CMenu.copyCallback = function (tr, data) {
    CMenu.doing = 'copy';
    CMenu.editModal.find('#indicator-name').val(data.name + '_copy');
    CMenu.editModal.find("#indicator-type-tq").show();
    CMenu.editModal.find("#indicator-type-wh").hide();
    CMenu.editModal.find("input[name='indicator-type']").eq('0').click();
    CMenu.editModal.attr('data_code', data.draft.code);
    CMenu.editModal.modal('show');
}

CMenu.editIndicator = function (e) {
    var name = $('#indicator-name').val();
    var type = CMenu.editModal.find("input[name='indicator-type']:checked").val();
    type = type == '0' ? 'custom' : 'custom_wh';
    if (!CMenu_Utils.validVariableName(name)) {
        alert('指标名称应符合 JavaScript 变量名命名规则。\n 第一个字符必须是字母、下划线（_）或美元符号（$）\n' +
            '余下的字符可以是下划线（_）、美元符号（$）或任何字母或数字字符。 \n 长度限制为20。');
        return;
    }
    if (CMenu.doing == 'new') {
        var wenhua = {prop: null, params: null};
        if (type == 'custom_wh') {
            wenhua = CMenu.getIndicatorWH_Prop_Params();
        }
        IStore.add({
            name: name,
            type: type,
            prop: wenhua.prop,
            params: wenhua.params
        }).then(function (i) {
            CMenu.update();
            CMenu.editModal.modal('hide');
        }, function (e) {
            if (e == 'ConstraintError') {
                alert('指标名称重复')
            } else {
                alert(e);
            }
        });
    } else if (CMenu.doing == 'copy') {
        IStore.add({
            name: name,
            type: type,
            draft: {
                code: CMenu.editModal.attr('data_code')
            }
        }).then(function (i) {
            CMenu.update();
            CMenu.editModal.modal('hide');
        }, function (e) {
            if (e == 'ConstraintError') {
                alert('指标名称重复')
            } else {
                alert(e);
            }
        });
    } else {
        var wenhua = {prop: null, params: null};
        if (type == 'custom_wh') {
            wenhua = CMenu.getIndicatorWH_Prop_Params();
        }
        IStore.saveDraft({
            key: CMenu.editing.key,
            name: name,
            type: type,
            prop: wenhua.prop,
            params: wenhua.params
        }).then(function (i) {
            CMenu.update();
            CMenu.editModal.modal('hide');
        }, function (e) {
            if (e == 'ConstraintError') {
                alert('指标名称重复')
            } else {
                alert(e);
            }
        });
    }
}

CMenu.getIndicatorWH_Prop_Params = function () {
    var prop = CMenu.attach_info.dom.find('td span.show-prop').text();
    var params = {}
    var trs = CMenu.attach_param.dom.find('tbody tr');
    for (var i = 1; i <= 6; i++) {
        var name = CMenu.attach_param.dom.find('tbody tr').find('.name_' + i).val();
        var max = CMenu.attach_param.dom.find('tbody tr').find('.max_' + i).val();
        var min = CMenu.attach_param.dom.find('tbody tr').find('.min_' + i).val();
        var default_value = CMenu.attach_param.dom.find('tbody tr').find('.default_' + i).val();
        params[i] = {name, max, min, default_value};
    }
    return {prop, params}

}

CMenu.trashIndicator = function (e) {
    CMenu.item_doms[CMenu.editing.key].remove();
    delete CMenu.item_doms[CMenu.editing.key];
    IStore.remove(CMenu.editing.key).then(function (i) {
        CMenu.update();
        CMenu.trashModal.modal('hide');
        // 删除选中指标后，选中第一个系统指标
        CMenu.sys_item_doms[0].find('td:first').click();
    }, function (e) {
        if (e == 'ConstraintError') {
            alert('指标名称重复')
        } else {
            alert(e);
        }
    });
}

CMenu.saveDraftIndicator = function (e) {
    var wenhua = {prop: null, params: null};
    if (CMenu.editing.type == 'custom_wh') {
        wenhua = CMenu.getIndicatorWH_Prop_Params();
    }
    IStore.saveDraft({
        key: CMenu.editing.key,
        name: CMenu.editing.name,
        draft: {
            code: CMenu.editor.getValue()
        },
        prop: wenhua.prop,
        params: wenhua.params
    }).then(function (result) {
        CMenu.editing = result;
    }, function (e) {
        alert(e);
    });
}

CMenu.saveFinalIndicator = function (e) {
    var wenhua = {prop: null, params: null};
    if (CMenu.editing.type == 'custom_wh') {
        wenhua = CMenu.getIndicatorWH_Prop_Params();
    }
    IStore.saveFinal({
        key: CMenu.editing.key,
        name: CMenu.editing.name,
        draft: {
            code: CMenu.editor.getValue()
        },
        prop: wenhua.prop,
        params: wenhua.params
    }).then(function (result) {
        CMenu.editing = result;
        // todo: generate indicator class
        console.log('saved && generate indicator class');
    }, function (e) {
        alert(e);
    });
}

CMenu.resetIndicator = function (e) {
    IStore.reset(CMenu.editing.key).then(function (result) {
        CMenu.editing = result;
        CMenu.editor.setValue(result.draft.code, 1);
    });
}


CMenu.editCallback = function (tr, key) {
    CMenu.doing = 'edit';
    IStore.getByKey(key).then(function (result) {
        CMenu.editModal.find('#indicator-name').val(result.name);
        if (result.type == 'custom') {
            CMenu.editModal.find("#indicator-type-tq").show();
            CMenu.editModal.find("#indicator-type-wh").hide();
            CMenu.editModal.find("input[name='indicator-type']").eq('0').click();
        } else if (result.type == 'custom_wh') {
            CMenu.editModal.find("#indicator-type-tq").hide();
            CMenu.editModal.find("#indicator-type-wh").show();
            CMenu.editModal.find("input[name='indicator-type']").eq('1').click();
        }
        CMenu.editModal.modal('show');
    });
}

CMenu.trashCallback = function (tr, key) {
    CMenu.doing = 'edit';
    IStore.getByKey(key).then(function (result) {
        CMenu.trashModal.find('#trash-indicator-name').text(result.name);
        CMenu.trashModal.modal('show');
    });
}

CMenu.update = function () {
    IStore.getAll().then(function (list) {
        CMenu.datas = list;
        CMenu.updateUI();
    }, function (e) {
        console.log(e);
    });
}

CMenu.updateUI = function () {
    for (var i = 0; i < CMenu.datas.length; i++) {
        var indicator = CMenu.datas[i];
        if (indicator.key == CMenu.editing.key) {
            CMenu.editing = indicator;
        }
        if (!CMenu.item_doms[indicator.key]) {
            CMenu.item_doms[indicator.key] = CMenu_Utils.getIndicatorTr(indicator, {
                select: CMenu.selectCallback,
                edit: CMenu.editCallback,
                trash: CMenu.trashCallback
            });
            CMenu.dom.append(CMenu.item_doms[indicator.key]);
        } else {
            var type = CMenu_Utils.getBrandTag(indicator.type);
            CMenu.item_doms[indicator.key].find('td:first').empty().append(type).append(indicator.name);
        }
    }
    CMenu.updateAttachUI();
}


CMenu_Utils = function () {
    var validVariableName = function (name) {
        // 匹配变量名的正则
        // 长度1-20，数字、字母、_、$ 组成，数字不能开头
        var regExp = /^[a-zA-Z\_\$][0-9a-zA-Z\_\$]{0,19}$/;
        return regExp.test(name);
    }
    var getBrandTag = function (type) {
        var setting = {
            system: {
                label_name: 'danger',
                label_text: '天',
            },
            custom: {
                label_name: 'danger',
                label_text: '天',
            },
            custom_wh: {
                label_name: 'info',
                label_text: '文',
            }
        }
        var d = $('<span></span>');
        d.addClass('label label-brand label-' + setting[type].label_name);
        d.append(setting[type].label_text);
        return d;
    }
    var getNameTd = function (data) {
        var td = $('<td></td>');
        if (data.type == 'system') {
            td.attr('colspan', 2);
        }
        td.append(CMenu_Utils.getBrandTag(data.type)).append(data.name);
        return td;
    }
    var getIconBtn = function (type) {
        var btn = $('<span class="glyphicon glyphicon-' + type + '"></span>')
        return ($('<td width="10%"></td>').append(btn));
    }
    var getIndicatorTr = function (data, callbacks) {
        // data.type 'system' callbacks[select edit trash]
        // data.type 'custom-*' callbacks[select copy]
        var tr = $('<tr></tr>');
        tr.on('click', function (e) {
            var tr = e.target.parentElement;
            if (e.target.parentElement.parentElement.nodeName == 'TR') {
                tr = e.target.parentElement.parentElement;
            }
            callbacks.select(tr, data);
        });
        tr.append(getNameTd(data));
        if (data.type == 'system') {
            var copy_btn = CMenu_Utils.getIconBtn('duplicate');
            copy_btn.on('click', function (e) {
                callbacks.copy(tr, data);
            });
            return tr.append(copy_btn);
        } else {
            var edit_btn = CMenu_Utils.getIconBtn('edit');
            edit_btn.on('click', function (e) {
                callbacks.edit(tr, data.key);
            });
            var trash_btn = CMenu_Utils.getIconBtn('trash');
            trash_btn.on('click', function (e) {
                callbacks.trash(tr, data.key);
            });
            return tr.append(edit_btn).append(trash_btn);
        }
    }
    return {
        validVariableName: validVariableName,
        getBrandTag: getBrandTag,
        getIconBtn: getIconBtn,
        getIndicatorTr: getIndicatorTr
    }
}();