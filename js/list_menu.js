var CMenu = function () {
    return {
        sys_dom: null,
        sys_item_doms: [],
        sys_datas: [],

        container: null,
        dom: null,
        editModal: null,
        trashModal: null,

        editor: null,

        datas: [],
        item_doms: {},
        editing: {},
        doing: '', // edit / new / copy

        regExp: /^[a-zA-Z\_\$][0-9a-zA-Z\_\$]*$/
    }
}();

// [a-zA-Z\_\$][0-9a-zA-Z\_\$]* 可以匹配由字母或下划线、$开头，后接任意个由一个数字、字母或者下划线、$组成的字符串，也就是JavaScript允许的变量名
// [a-zA-Z\_\$][0-9a-zA-Z\_\$]{0, 19} 限制了变量的长度是1-20个字符

CMenu.initSysIndicators = function () {
    CMenu.sys_dom = $('#system-indicators');
    $.get('/defaults/defaults.json').then(function (response) {
        var all_promises = [];
        for (var name in response) {
            all_promises.push(function (name, memo) {
                return $.get('/defaults/' + response[name].file_name).then(function (response) {
                    var item = {
                        // key: name,
                        name: name,
                        memo: memo,
                        type: 'system',
                        draft: {
                            code: response
                        }
                    };
                    CMenu.sys_datas.push(item);
                });
            }(response[name].name, response[name].memo));
        }
        Promise.all(all_promises).then(function () {
            for (var i = 0; i < CMenu.sys_datas.length; i++) {
                var tr = CMenu.getOneSysIndicator(CMenu.sys_datas[i], CMenu.sysSelectCallback, CMenu.copyCallback);
                CMenu.sys_item_doms.push(tr);
                CMenu.sys_dom.append(tr);
            }
            CMenu.sysSelectCallback(CMenu.sys_item_doms[0][0], CMenu.sys_datas[0]);
        });
    });
}

CMenu.init = function (div_id) {
    CMenu.initSysIndicators();

    CMenu.container = $('table#' + div_id);
    CMenu.dom = $('<tbody></tbody>').append($('<div><img width="40" height="40" src="/img/loading.svg"></img></div>'));
    CMenu.container.append(CMenu.dom);

    CMenu.editModal = $('#EditModal');
    CMenu.trashModal = $('#TrashModal');

    CMenu.editor = ace.edit('editor');
    CMenu.editor.$blockScrolling = Infinity;
    CMenu.editor.getSession().on('changeMode', function () {
        CMenu.editor.getSession().$worker.send("changeOptions", [{loopfunc: true}]);
    });
    CMenu.editor.getSession().setMode("ace/mode/javascript");

    IStore.init().then(function (s) {
        IStore.getAll().then(function (list) {
            // 显示UI
            CMenu.datas = list;
            //初始化指标类
            TM.init();
            CMenu.dom.empty();
            CMenu.updateUI();
        }, function (e) {
            console.log(e);
        });
    });
}

CMenu.addAction = function () {
    CMenu.doing = 'new';
    CMenu.editModal.find('#indicator-name').val('');
    CMenu.editModal.find("#indicator-type-tq").show();
    CMenu.editModal.find("#indicator-type-wh").show();
    CMenu.editModal.find("input[name='indicator-type']").eq('0').click();
    CMenu.editModal.find('#indicator-memo').val('');
    CMenu.editModal.modal('show');
}

CMenu.copyCallback = function (tr, data) {
    CMenu.doing = 'copy';
    CMenu.editModal.find('#indicator-name').val(data.name);
    CMenu.editModal.find("#indicator-type-tq").show();
    CMenu.editModal.find("#indicator-type-wh").hide();
    CMenu.editModal.find("input[name='indicator-type']").eq('0').click();
    CMenu.editModal.find('#indicator-memo').val(data.memo);
    CMenu.editModal.attr('data_code', data.draft.code);
    CMenu.editModal.modal('show');
}

CMenu.editIndicator = function (e) {
    var name = $('#indicator-name').val();
    var type = CMenu.editModal.find("input[name='indicator-type']:checked").val();
    type = type == '0' ? 'custom' : 'custom_wh';
    var memo = $('#indicator-memo').val();
    if (!CMenu.regExp.test(name)) {
        alert('指标名称应符合 JavaScript 变量名命名规则。\n 第一个字符必须是字母、下划线（_）或美元符号（$）\n' +
            '余下的字符可以是下划线（_）、美元符号（$）或任何字母或数字字符');
        return;
    }
    if (CMenu.doing == 'new') {
        IStore.add({
            name: name,
            type: type,
            memo: memo,
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
    if (CMenu.doing == 'copy') {
        IStore.add({
            name: name,
            type: type,
            memo: memo,
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
        IStore.saveDraft({
            key: CMenu.editing.key,
            name: name,
            type: type,
            memo: memo,
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

CMenu.trashIndicator = function (e) {
    CMenu.item_doms[CMenu.editing.key].remove();
    delete CMenu.item_doms[CMenu.editing.key];
    IStore.remove(CMenu.editing.key).then(function (i) {
        CMenu.update();
        CMenu.trashModal.modal('hide');
    }, function (e) {
        if (e == 'ConstraintError') {
            alert('指标名称重复')
        } else {
            alert(e);
        }
    });
}

CMenu.saveDraftIndicator = function (e) {
    IStore.saveDraft({
        key: CMenu.editing.key,
        name: CMenu.editing.name,
        memo: CMenu.editing.memo,
        draft: {
            code: CMenu.editor.getValue()
        }
    }).then(function (result) {
        CMenu.editing = result;
        console.log('saved');
    }, function (e) {
        alert(e);
    });
}

CMenu.saveFinalIndicator = function (e) {
    IStore.saveFinal({
        key: CMenu.editing.key,
        name: CMenu.editing.name,
        memo: CMenu.editing.memo,
        draft: {
            code: CMenu.editor.getValue()
        }
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

CMenu.selectCallback = function (tr, key) {
    $('#btn_editor_save').attr('disabled', false);
    $('#btn_editor_run').attr('disabled', false);
    $('#btn_editor_reset').attr('disabled', false);

    for (var k in CMenu.item_doms) {
        CMenu.item_doms[k][0].classList.remove('active');
    }
    for (var k in CMenu.sys_item_doms) {
        CMenu.sys_item_doms[k][0].classList.remove('active');
    }
    tr.classList.add('active');

    IStore.getByKey(key).then(function (result) {
        CMenu.editing = result;
        CMenu.editor.setValue(result.draft.code, 1);
        CMenu.editor.setReadOnly(false);
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
        CMenu.editModal.find('#indicator-memo').val(result.memo);
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
        if (!CMenu.item_doms[indicator.key]) {
            CMenu.item_doms[indicator.key] = CMenu.getOneIndicator(indicator, CMenu.selectCallback, CMenu.editCallback, CMenu.trashCallback);
            CMenu.dom.append(CMenu.item_doms[indicator.key]);
        } else {
            var type = CMenu.getTypeTag(indicator.type);
            CMenu.item_doms[indicator.key].find('td:first').empty().append(type).append(indicator.name);
        }
    }
}

CMenu.getBtn = function (type) {
    var btn = $('<span class="glyphicon glyphicon-' + type + '"></span>')
    return ($('<td width="10%"></td>').append(btn));
}

CMenu.getTdName = function (data) {
    return $('<td>' + data.name + '</td>');
}

CMenu.getOneIndicator = function (data, selectCallback, editCallback, trashCallback) {
    var tr = $('<tr></tr>');
    tr.on('click', function (e) {
        var tr = e.target.parentElement;
        if (e.target.parentElement.parentElement.nodeName == 'TR') {
            tr = e.target.parentElement.parentElement;
        }
        selectCallback(tr, data.key);
    });
    var td = $('<td  width="80%"></td>').append(CMenu.getTypeTag(data.type));
    td.append(data.name);
    tr.append(td);

    var edit_btn = CMenu.getBtn('edit');
    edit_btn.on('click', function (e) {
        editCallback(tr, data.key);
    });
    var trash_btn = CMenu.getBtn('trash');
    trash_btn.on('click', function (e) {
        trashCallback(tr, data.key);
    });
    return tr.append(edit_btn).append(trash_btn);
}

CMenu.sysSelectCallback = function (tr, data) {
    $('#btn_editor_save').attr('disabled', true);
    $('#btn_editor_run').attr('disabled', true);
    $('#btn_editor_reset').attr('disabled', true);

    for (var k in CMenu.item_doms) {
        CMenu.item_doms[k][0].classList.remove('active');
    }
    for (var k in CMenu.sys_item_doms) {
        CMenu.sys_item_doms[k][0].classList.remove('active');
    }
    tr.classList.add('active');
    CMenu.editing = data;
    CMenu.editor.setValue(data.draft.code, 1);
    CMenu.editor.setReadOnly(true);
}

CMenu.getOneSysIndicator = function (data, selectCallback, copyCallback, trashCallback) {
    var tr = $('<tr></tr>');
    tr.on('click', function (e) {
        var tr = e.target.parentElement;
        if (e.target.parentElement.parentElement.nodeName == 'TR') {
            tr = e.target.parentElement.parentElement;
        }
        selectCallback(tr, data);
    });
    var td = $('<td colspan="2"></td>').append(CMenu.getTypeTag('custom'));
    td.append(data.name);
    tr.append(td);
    var copy_btn = CMenu.getBtn('duplicate');
    copy_btn.on('click', function (e) {
        copyCallback(tr, data);
    });
    return tr.append(copy_btn);
}

CMenu.getTypeTag = function (type) {
    var setting = {
        custom: {
            label_name: 'danger',
            label_text: '天勤',
        },
        custom_wh: {
            label_name: 'info',
            label_text: '文华',
        }
    }
    return $('<span class="label label-' + setting[type].label_name + '">' + setting[type].label_text + '</span>');
}