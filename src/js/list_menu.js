const CMenu = (function () {
    return {
        $container: null,
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
        $editModal: null,
        $trashModal: null,

        // info panel && // param panel
        $attach_container: null,
        attach_info: {},
        attach_param: {},
        attach_btns: {},

        editing: {},
        doing: '', // edit / new / copy
    };
}());

CMenu.init = function (div) {
    // 初始化对象
    CMenu.$container = $('table#' + div);
    CMenu.sys_dom = CMenu.$container.find('#system-indicators');
    CMenu.sys_dom.append($('<div><h5>Loading...</h5></div>'));
    CMenu.dom = CMenu.$container.find('#custom-indicators');
    CMenu.dom.append($('<div><h5>Loading...</h5></div>'));

    // 附加信息区域
    CMenu.initAttachUI();

    // 初始化系统指标
    // 初始化时默认选中第一个系统指标
    let promiseSys = CMenu.initSysIndicators();

    // 初始化用户自定义指标
    CMenu.$editModal = $('#EditModal');
    CMenu.$trashModal = $('#TrashModal');
    let promiseCus = CMenu.initCustomIndicators();

    Promise.all([promiseCus, promiseSys]).then(function () {
        //初始化指标类
        sendIndicatorList();
    });

    // 初始化代码编辑区域
    CMenu.editor = ace.edit('editor');
    CMenu.editor.$blockScrolling = Infinity;
    CMenu.editor.getSession().on('changeMode', function () {
        CMenu.editor.getSession().$worker.send('changeOptions', [{ loopfunc: true }]);
    });

    CMenu.editor.getSession().setMode('ace/mode/javascript');
    CMenu.editor.commands.addCommand({
        name: 'saverun',
        bindKey: { win: 'Ctrl-Shift-S', mac: 'Command-Shift-S', sender: 'editor|cli' },
        exec: function (editor) {
            $('#btn_editor_run').click();
        },

        readOnly: false,
    });

    CMenu.initThemeContainer();
};

CMenu.selectCallback = function (tr, data) {
    for (let k in CMenu.sys_item_doms) {
        CMenu.sys_item_doms[k][0].classList.remove('active');
    }

    for (let k in CMenu.item_doms) {
        CMenu.item_doms[k][0].classList.remove('active');
    }

    tr.classList.add('active');
    if (data.type === 'system') {
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
            CMenu.updateAttachUI();
        });
    }

    CMenu.editor.focus();
    if (data.type === 'system' || data.type === 'custom') {
        let center = $('div.main-container div.content-container')[0];
        center.classList.remove('col-xs-6');
        center.classList.add('col-xs-9');
        $('div.main-container div.right-menu')[0].classList.add('hide');
    } else if (data.type === 'custom_wh') {
        let center = $('div.main-container div.content-container')[0];
        center.classList.remove('col-xs-9');
        center.classList.add('col-xs-6');
        $('div.main-container div.right-menu')[0].classList.remove('hide');
    }
};

CMenu.initAttachUI = function () {
    CMenu.$attach_container = $('div#attachment-container');
    CMenu.attach_info = {
        dom: $('<div class="panel panel-default"></div>').append($('<div class="panel-heading">基本信息</div>')),
    };

    let $infoTable = $(`<table class="table">
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
    $infoTable.find('.indicator-prop').on('click', function (e) {
        $infoTable.find('button>span.show-prop').text(this.innerText);
    });

    CMenu.attach_info.dom.append($infoTable);

    // param_dom start
    CMenu.attach_param = {
        dom: $('<div class="panel panel-default"></div>').append($('<div class="panel-heading">参数列表</div>')),
    };
    let $paramTable = $('<table class="table table-bordered wh-param-list"></table>');
    let $paramThead = $(`<thead>
                        <tr>
                            <th>参数</th>
                            <th>名称</th>
                            <th>最大</th>
                            <th>最小</th>
                            <th>缺省</th>
                        </tr>
                        </thead>`);
    let $paramTbody = $('<tbody></tbody>');
    for (let i = 1; i <= 6; i++) {
        let $tr = $('<tr></tr>');
        let $tdId = $('<td>' + i + '</td>');
        let $tdName = $('<td><input type="text" readonly class="form-control ' + ('name_' + i) + '"/></td>');
        let $tdMax = $('<td><input type="number" readonly class="form-control ' + ('max_' + i) + '"/></td>');
        let $tdMin = $('<td><input type="number" readonly class="form-control ' + ('min_' + i) + '"/></td>');
        let $tdDefault = $('<td><input type="number" readonly class="form-control ' + ('default_' + i) + '"/></td>');
        $tr.append($tdId).append($tdName).append($tdMax).append($tdMin).append($tdDefault);
        $paramTbody.append($tr);
    }

    $paramTbody.find('input').on('click', function (e) {
        $(this).attr('readonly', false);
    });

    $paramTable.append($paramThead).append($paramTbody);
    CMenu.attach_param.dom.append($paramTable);
    CMenu.$attach_container.append(CMenu.attach_info.dom).append(CMenu.attach_param.dom);
};

CMenu.updateAttachUI = function () {
    let indicator = CMenu.editing;
    let typeStr = {
        system: '天勤脚本语言',
        custom: '天勤脚本语言',
        custom_wh: '文华脚本语言',
    };
    if (indicator.type === 'custom_wh') {
        CMenu.attach_info.dom.find('.name').text(indicator.name);
        CMenu.attach_info.dom.find('.type').text(typeStr[indicator.type]);
        CMenu.attach_info.dom.find('td span.show-prop').text(indicator.prop);
        let trs = CMenu.attach_param.dom.find('tbody tr');
        for (let i = 1; i <= 6; i++) {
            trs.find('.name_' + i).val(indicator.params[i].name);
            trs.find('.max_' + i).val(indicator.params[i].max);
            trs.find('.min_' + i).val(indicator.params[i].min);
            trs.find('.default_' + i).val(indicator.params[i].default_value);
        }
    }
};

CMenu.initSysIndicators = function () {
    return new Promise((resolve, reject) => {
        $.get('/defaults/defaults.json').then(function (response) {
            let allPromises = [];
            for (let i = 0; i < response.length; i++) {
                allPromises.push(function (name) {
                    return $.ajax({
                        url: '/defaults/' + name + '.js',
                        dataType: 'text',
                    }).then(function (response) {
                        let item = {
                            // key: name,
                            name: name,
                            type: 'system',
                            draft: {
                                code: response,
                            },
                        };
                        CMenu.sys_datas.push(item);
                    });
                }(response[i]));
            }

            Promise.all(allPromises).then(function () {
                CMenu.sys_dom.empty();
                for (let i = 0; i < CMenu.sys_datas.length; i++) {
                    let tr = CMenuUtils.getIndicatorTr(CMenu.sys_datas[i], {
                        select: CMenu.selectCallback,
                        copy: CMenu.copyCallback,
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

};

CMenu.initCustomIndicators = function () {
    return new Promise((resolve, reject) => {
        IStore.init().then(function () {
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

};

CMenu.addAction = function () {
    CMenu.doing = 'new';
    CMenu.$editModal.find('#indicator-name').val('');
    CMenu.$editModal.find('#indicator-type-tq').show();
    CMenu.$editModal.find('#indicator-type-wh').show();
    CMenu.$editModal.find("input[name='indicator-type']").eq('0').click();
    CMenu.$editModal.modal('show');
};

CMenu.copyCallback = function (tr, data) {
    CMenu.doing = 'copy';
    CMenu.$editModal.find('#indicator-name').val(data.name + '_copy');
    CMenu.$editModal.find('#indicator-type-tq').show();
    CMenu.$editModal.find('#indicator-type-wh').hide();
    CMenu.$editModal.find("input[name='indicator-type']").eq('0').click();
    CMenu.$editModal.attr('data_code', data.draft.code);
    CMenu.$editModal.modal('show');
};

// 检查 系统指标 和 用户自定义指标 是否有指标名称是 name
CMenu.hasClassName = function (name) {
    let lists = ['sys_datas', 'datas'];
    for (let i = 0; i < lists.length; i++) {
        for (let j = 0; j < CMenu[lists[i]].length; j++) {
            if (name === CMenu[lists[i]][j].name) return true;
        }
    }

    return false;
};

CMenu.editIndicator = function (e) {

    let name = $('#indicator-name').val();
    let type = CMenu.editModal.find("input[name='indicator-type']:checked").val();
    type = type === '0' ? 'custom' : 'custom_wh';
    if (!CMenuUtils.validVariableName(name)) {
        Notify.error('指标名称应符合 JavaScript 变量名命名规则。\n 第一个字符必须是字母、下划线（_）或美元符号（$）\n' +
            '余下的字符可以是下划线（_）、美元符号（$）或任何字母或数字字符。 \n 长度限制为20。');
        return;
    }

    if (CMenu.hasClassName(name)) {
        Notify.error('指标名称重复');
        return;
    }

    if (CMenu.doing === 'new') {
        let codeDefault = 'function* ' + name + '(C) {\n\t\n}';
        let wenhua = { prop: null, params: null };
        if (type === 'custom_wh') {
            wenhua = CMenu.getIndicatorWH_Prop_Params();
            codeDefault = '';
        }

        IStore.add({
            name: name,
            type: type,
            prop: wenhua.prop,
            params: wenhua.params,
            draft: {
                code: codeDefault,
            },
        }).then(function (i) {
            CMenu.update(() => {
                CMenu.dom.find('tr.' + name + ' td')[0].click();
            });
            CMenu.editModal.modal('hide');
        }, function (e) {

            if (e === 'ConstraintError') {
                Notify.error('指标名称重复');
            } else {
                Notify.error(e);
            }
        });
    } else if (CMenu.doing === 'copy') {
        let code = CMenu.editModal.attr('data_code');
        let re = /^(function\s*\*\s*).*(\s*\(\s*C\s*\)\s*\{[\s\S]*\})$/g;
        let resCode = code.trim().replace(re, '$1' + name + '$2');
        IStore.add({
            name: name,
            type: type,
            draft: {
                code: resCode,
            },
        }).then(function (i) {
            CMenu.update(() => {
                CMenu.dom.find('tr.' + name + ' td')[0].click();
            });
            CMenu.editModal.modal('hide');
        }, function (e) {

            if (e === 'ConstraintError') {
                Notify.error('指标名称重复');
            } else {
                Notify.error(e);
            }
        });
    } else {
        let wenhua = { prop: null, params: null };
        if (type === 'custom_wh') {
            wenhua = CMenu.getIndicatorWH_Prop_Params();
        }

        IStore.saveDraft({
            key: CMenu.editing.key,
            name: name,
            type: type,
            prop: wenhua.prop,
            params: wenhua.params,
        }).then(function (i) {
            CMenu.update(() => {
                CMenu.dom.find('tr.' + name + ' td')[0].click();
            });
            CMenu.editModal.modal('hide');
        }, function (e) {

            if (e === 'ConstraintError') {
                Notify.error('指标名称重复');
            } else {
                Notify.error(e);
            }
        });
    }
};

// 从 UI界面 取得文华脚本的 Prop && Params
CMenu.getIndicatorWH_Prop_Params = function () {
    let prop = CMenu.attach_info.dom.find('td span.show-prop').text();
    let params = {};
    let trs = CMenu.attach_param.dom.find('tbody tr');
    for (let i = 1; i <= 6; i++) {
        let name = CMenu.attach_param.dom.find('tbody tr').find('.name_' + i).val();
        let max = CMenu.attach_param.dom.find('tbody tr').find('.max_' + i).val();
        let min = CMenu.attach_param.dom.find('tbody tr').find('.min_' + i).val();
        let defaultValue = CMenu.attach_param.dom.find('tbody tr').find('.default_' + i).val();
        params[i] = { name, max, min, defaultValue };
    }

    return { prop, params };
};

// 删除当前编辑的指标
CMenu.trashIndicator = function (e) {
    let indicatorName = CMenu.editing.name;

    // UI界面 删除DOM
    CMenu.item_doms[CMenu.editing.key].remove();

    // 删除内存数据
    delete CMenu.item_doms[CMenu.editing.key];

    // 删除数据库存储数据
    IStore.remove(CMenu.editing.key).then(function (i) {
            // 更新界面
            CMenu.update(() => {
                // todo: 选中下一个自选指标 | 删除选中指标后，选中第一个系统指标
                CMenu.sys_item_doms[0].find('td:first').click();
            });

            // 关闭确认框
            CMenu.$trashModal.modal('hide');

            // 通知webworker unregister_indicator
            worker.postMessage({ cmd: 'unregister_indicator', content: indicatorName });
        },

        function (e) {
            Notify.error(e.toString());
        });
};

CMenu.saveDraftIndicator = function (e) {
    let wenhua = { prop: null, params: null };
    if (CMenu.editing.type === 'custom_wh') {
        wenhua = CMenu.getIndicatorWH_Prop_Params();
    }

    IStore.saveDraft({
        key: CMenu.editing.key,
        name: CMenu.editing.name,
        draft: {
            code: CMenu.editor.getValue(),
        },
        prop: wenhua.prop,
        params: wenhua.params,
    }).then(function (result) {
        CMenu.editing = result;
        worker.postMessage({ cmd: 'indicator', content: result });
    }, function (e) {

        Notify.error(e);
    });
};

CMenu.saveFinalIndicator = function (e) {
    let wenhua = { prop: null, params: null };
    if (CMenu.editing.type === 'custom_wh') {
        wenhua = CMenu.getIndicatorWH_Prop_Params();
    }

    IStore.saveFinal({
        key: CMenu.editing.key,
        name: CMenu.editing.name,
        draft: {
            code: CMenu.editor.getValue(),
        },
        prop: wenhua.prop,
        params: wenhua.params,
    }).then(function (result) {
        CMenu.updateUI(result);
    }, function (e) {

        Notify.error(e);
    });
};

CMenu.resetIndicator = function (e) {
    IStore.reset(CMenu.editing.key).then(function (result) {
        CMenu.editing = result;
        CMenu.editor.setValue(result.draft.code, 1);
        CMenu.editor.focus();
    });
};

CMenu.editCallback = function (tr, key) {
    CMenu.doing = 'edit';
    IStore.getByKey(key).then(function (result) {
        CMenu.editModal.find('#indicator-name').val(result.name);
        if (result.type === 'custom') {
            CMenu.editModal.find('#indicator-type-tq').show();
            CMenu.editModal.find('#indicator-type-wh').hide();
            CMenu.editModal.find("input[name='indicator-type']").eq('0').click();
        } else if (result.type === 'custom_wh') {
            CMenu.editModal.find('#indicator-type-tq').hide();
            CMenu.editModal.find('#indicator-type-wh').show();
            CMenu.editModal.find("input[name='indicator-type']").eq('1').click();
        }

        CMenu.editModal.modal('show');
    });
};

CMenu.trashCallback = function (tr, key) {
    CMenu.doing = 'edit';
    IStore.getByKey(key).then(function (result) {
        CMenu.$trashModal.find('#trash-indicator-name').text(result.name);
        CMenu.$trashModal.modal('show');
    });
};

CMenu.update = function (fun) {
    IStore.getAll().then(function (list) {
        CMenu.datas = list;
        CMenu.updateUI();
        if (fun) {
            fun();
        }

    }, function (e) {

        console.log(e);
    });
};

CMenu.updateUI = function (indicator) {
    for (let i = 0; i < CMenu.datas.length; i++) {
        if (indicator && CMenu.datas[i].key === indicator.key) {
            CMenu.datas[i] = indicator;
            CMenu.editing = indicator;
        } else {
            indicator = CMenu.datas[i];
            if (indicator.key === CMenu.editing.key) {
                CMenu.editing = indicator;
            }
        }

        if (!CMenu.item_doms[indicator.key]) {
            CMenu.item_doms[indicator.key] = CMenuUtils.getIndicatorTr(indicator, {
                select: CMenu.selectCallback,
                edit: CMenu.editCallback,
                trash: CMenu.trashCallback,
            });
            CMenu.dom.append(CMenu.item_doms[indicator.key]);
        } else {
            let type = CMenuUtils.getBrandTag(indicator.type);
            CMenu.item_doms[indicator.key].find('td:first').empty().append(type).append(indicator.name);
        }

        if (ErrorHandlers.has(indicator.name)) {
            let timeout = CMenuUtils.getBrandTag('timeout');
            CMenu.item_doms[indicator.key].find('td:first').append(timeout);
        }
    }

    CMenu.updateAttachUI();
};

CMenu.initThemeContainer = function () {
    let themes = [
        'ambiance',
        'chaos',
        'chrome',
        'clouds',
        'clouds_midnight',
        'cobalt',
        'crimson_editor',
        'dawn',
        'dreamweaver',
        'eclipse',
        'github',
        'gruvbox',
        'idle_fingers',
        'iplastic',
        'katzenmilch',
        'kr_theme',
        'kuroir',
        'merbivore',
        'merbivore_soft',
        'mono_industrial',
        'monokai',
        'pastel_on_dark',
        'solarized_dark',
        'solarized_light',
        'sqlserver',
        'terminal',
        'textmate',
        'tomorrow',
        'tomorrow_night',
        'tomorrow_night_blue',
        'tomorrow_night_bright',
        'tomorrow_night_eighties',
        'twilight',
        'vibrant_ink',
        'xcode',
    ];
    let the = localStorage.getItem('theme');
    if (the === null) {
        the = 'textmate';
        localStorage.setItem('theme', the);
    }

    $('.theme-container .show-theme').text(the);
    CMenu.editor.setTheme('ace/theme/' + the);
    let str = '';
    let $ul = $('.theme-container .dropdown-menu');
    for (let i = 0; i < themes.length; i++) {
        str += ('<li><a href="#" class="' + themes[i] + '">' + themes[i] + '</a></li>');
    }

    $ul.html(str);
    $ul.css({
        height: '200px',
        overflow: 'scroll',
    });
    $ul.on('click', function (e) {
        CMenu.changeEditorTheme(e.target.className);
    });
};

CMenu.changeEditorTheme = function (the) {
    $('.theme-container .show-theme').text(the);
    CMenu.editor.setTheme('ace/theme/' + the);
    localStorage.setItem('theme', the);
};

CMenuUtils = (function () {
    let validVariableName = function (name) {
        // 匹配变量名的正则
        // 长度1-20，数字、字母、_、$ 组成，数字不能开头
        let regExp = /^[a-zA-Z\_\$][0-9a-zA-Z\_\$]{0,19}$/;
        return regExp.test(name);
    };

    let getBrandTag = function (type) {
        let setting = {
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
            },
            timeout: {
                label_name: 'danger',
                label_text: '错误',
            },
        };
        let $d = $('<span></span>');

        $d.addClass('label label-brand label-' + setting[type].label_name);
        $d.append(setting[type].label_text);
        return $d;
    };

    let getNameTd = function (data) {
        let $td = $('<td></td>');
        $td.append(CMenuUtils.getBrandTag(data.type)).append(data.name);
        return $td;
    };

    let getIconBtn = function (type) {
        let $btn = $('<span class="glyphicon glyphicon-' + type + '"></span>');
        return ($('<td width="10%"></td>').append($btn));
    };

    let getIndicatorTr = function (data, callbacks) {
        // data.type 'system' callbacks[select edit trash]
        // data.type 'custom-*' callbacks[select copy]
        let $tr = $('<tr class="' + data.name + '"></tr>');
        $tr.on('click', function (e) {
            let $tr = e.target.parentElement;
            if (e.target.parentElement.parentElement.nodeName === 'TR') {
                $tr = e.target.parentElement.parentElement;
            }

            callbacks.select($tr, data);
        });

        $tr.append(getNameTd(data));
        if (data.type === 'system') {
            let copyBtn = CMenuUtils.getIconBtn('duplicate');
            copyBtn.on('click', function (e) {
                callbacks.copy($tr, data);
            });

            return $tr.append(copyBtn);
        } else {
            let trashBtn = CMenuUtils.getIconBtn('trash');
            trashBtn.on('click', function (e) {
                callbacks.trash($tr, data.key);
            });

            return $tr.append(trashBtn);
        }
    };

    return {
        validVariableName: validVariableName,
        getBrandTag: getBrandTag,
        getIconBtn: getIconBtn,
        getIndicatorTr: getIndicatorTr,
    };
}());
