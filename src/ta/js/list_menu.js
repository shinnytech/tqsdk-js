
class FileHelper{
    constructor(dir = ''){
        this.dir = dir;
    }
    write(path, content){
        return window.writeFile('extension/libs/' + this.dir + path, content);
    }
    read(path){
        return window.readFile('extension/libs/' + this.dir + path);
    }
    del(path){
        return window.removeFile('extension/libs/' + this.dir + path);
    }
    list(dirpath = ''){
        return window.listFile('extension/libs/' + this.dir + dirpath);
    }
}

class IndCtrl{
    constructor (menu_id, editor_id, webworker_url){
        this.sysFileHelper = new FileHelper('../libs/ind/');
        this.cusFileHelper = new FileHelper('../libs/custom/');

        this.codeTemplate = '';

        this.sys_dom = $('table#' + menu_id).find('#system-indicators');
        this.dom = $('table#' + menu_id).find('#custom-indicators');

        this.editor = ace.edit(editor_id);

        this.webworker = new TqWebWorker(webworker_url, {
            websocket_reconnect: this.workerWsReconnectCB.bind(this),
            calc_start: this.workerCalcStartCB.bind(this),
            calc_end: this.workerCalcEndCB.bind(this),
            feedback: this.workerFeedbackCB.bind(this)
        });
        this.errStore = new ErrorStore('err', this.webworker);

        // 指标数据存储
        this.sys_datas = {};
        this.waitingResult = new Set();

        // 删除对话框
        this.$trashModal = $('#TrashModal');
        // 当前编辑的指标
        this.editing = '';

        this.init();
        this.init_editor();
        this.init_editor_theme();
    }
    init(){
        this.sys_dom.append($('<div><h5>Loading...</h5></div>'));
        this.dom.append($('<div><h5>Loading...</h5></div>'));

        let key = -1;
        for(var file of this.sysFileHelper.list()){
            let [fileName, fileType] = file.split('.');
            if(fileType == 'js'){
                let fileContent = this.sysFileHelper.read(file);
                if (fileName == 'template'){
                    this.codeTemplate = fileContent;
                } else {
                    this.sys_datas[key] = {
                        key,
                        name: fileName,
                        path: this.sysFileHelper.dir + fileName + '.js',
                        type: 'system',
                        code: fileContent
                    };
                    key -= 1;
                }
            }
        }

        let datas = {};
        key = 0;
        for(var file of this.cusFileHelper.list()){
            let [fileName, fileType] = file.split('.');
            if(fileType == 'js'){
                let fileContent = this.cusFileHelper.read(file);
                datas[key] = {
                    key,
                    name: fileName,
                    path: this.cusFileHelper.dir + fileName + '.js',
                    type: 'custom',
                    code: fileContent
                };
                key += 1;
            }
        }

        this.IndKeyManager = (function(key){
            return {
                get: () => key += 1
            }
        }).call(this, key);

        this.datas = new Proxy(datas, {
            set: (function (target, key, value, receiver) {
                var ret = Reflect.set(target, key, value, receiver);
                // 更新UI
                this.updateUI();
                this.dom.find('tr.' + key + ' td:first').click();
                this.cusFileHelper.write(value.name + '.js', value.code);
                return ret;
            }).bind(this),
            deleteProperty: (function(target, propKey){
                // 更新UI
                let $delTr = this.dom.find('tr.' + propKey);
                let $nextTr = null;
                if (propKey == this.editing.key){
                    // 选择另一个指标
                    $nextTr = $delTr.next('tr');
                    if ($nextTr.length === 0) {
                        $nextTr = $delTr.prev('tr');
                        if ($nextTr.length === 0) $nextTr = 0;
                    }
                }
                $delTr.remove(); // UI 删除界面
                if ($nextTr == 0){
                    this.sys_dom.find('td:first').click();
                } else if ($nextTr) {
                    $nextTr.find('td:first').click();
                }
                this.cusFileHelper.del(target[propKey].name + '.js');
                var ret = Reflect.deleteProperty(target, propKey);
                return ret;
            }).bind(this)
        });

        //初始所有化指标类
        IndCtrl.registerIndicator(this.webworker, this.sys_datas);
        IndCtrl.registerIndicator(this.webworker, this.datas);

        // 更新系统指标ui
        this.sys_dom.empty();
        for(var k in this.sys_datas){
            let tr = IndCtrl.getIndicatorTr(this.sys_datas[k], {
                select: this.selectCallback.bind(this),
                copy: this.copyCallback.bind(this),
            });
            this.sys_dom.append(tr);
        }
        // 初始化时默认选中第一个系统指标
        this.sys_dom.find('td:first').click();

        // 初始化用户自定义指标ui
        this.dom.empty();
        this.updateUI();
    }
    init_editor(){
        // 初始化代码编辑区域
        this.editor.getSession().setMode('ace/mode/javascript');
        ace.require('ace/ext/language_tools');
        this.editor.$blockScrolling = Infinity;
        let session = this.editor.getSession();
        var interval = setInterval(() => {
            if (session.$worker) {
                session.$worker.send('changeOptions', [{
                    strict: false,
                },]);
                clearInterval(interval);
            }
        }, 50);

        this.editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: true,
            enableLinking: true,
        });

        /*************** keywords link Click ***************/
        this.editor.on('linkClick', function (data) {
            var types = ['support.function.tianqin', 'constant.language.function'];
            var functype = ['cfunc', 'efunc'];
            var index = types.indexOf(data.token.type);
            if (data && data.token && index > -1) {
                let lowerCase = data.token.value.toLowerCase();
                window.open(`http://doc.tq18.cn/tq/latest/usage/ta/${functype[index]}/${lowerCase}.html`);
            }
        });

        /*************** mousemove + tooltips ***************/
        this.editor.on('mousemove', (function (e) {
            var position = e.getDocumentPosition();
            var token = this.editor.getSession().getTokenAt(position.row, position.column);
            if (position && token) {
                var types = Object.keys(TqTooltips);
                if (types.indexOf(token.type) > -1) {
                    let pixelPosition = this.editor.renderer.textToScreenCoordinates(position);
                    pixelPosition.pageY += this.editor.renderer.lineHeight;
                    IndCtrl.updateTooltip(pixelPosition, token);
                } else {
                    IndCtrl.updateTooltip(this.editor.renderer.textToScreenCoordinates(position));
                }
            }
        }).bind(this));

        /*************** Command-S / Ctrl-S ***************/
        this.editor.commands.addCommand({
            name: 'saverun',
            bindKey: { win: 'Ctrl-S', mac: 'Command-S', sender: 'editor|cli' },
            exec: function (editor) {
                $('#btn_editor_run').click();
            },
            readOnly: false,
        });
    }
    init_editor_theme(){
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
        this.editor.setTheme('ace/theme/' + the);

        let str = '';
        let $ul = $('.theme-container .dropdown-menu');
        for (let i = 0; i < themes.length; i++) {
            str += ('<li><a href="#" class="' + themes[i] + '">' + themes[i] + '</a></li>');
        }
        $ul.html(str);
        $ul.css({ height: '200px', overflow: 'scroll'});
        $ul.on('click', (function (e) {
            let the = e.target.className;
            $('.theme-container .show-theme').text(the);
            this.editor.setTheme('ace/theme/' + the);
            localStorage.setItem('theme', the);
        }).bind(this));
    }
    workerWsReconnectCB (){
        IndCtrl.registerIndicator(this.webworker, this.sys_datas);
        IndCtrl.registerIndicator(this.webworker, this.datas);
    }
    workerCalcStartCB (content){
        this.errStore.records[content.id] = setTimeout((function(){
            Notify.error(content.className + ' 运行超时！');
            this.errStore.add(content.className);
            this.updateUI();
            this.webworker.worker.terminate();
            this.webworker.init();
            IndCtrl.registerIndicator(this.webworker, this.sys_datas);
            IndCtrl.registerIndicator(this.webworker, this.datas);
        }).bind(this), CODE_RUN_TIMEOUT);
    }
    workerCalcEndCB(content){
        clearTimeout(this.errStore.records[content.id]);
        delete this.errStore.records[content.id];
    }
    workerFeedbackCB(content){
        if (content.error) {
            Notify.error(content);
            this.errStore.add(content.func_name);
            this.updateUI();
            if (content.type === 'run' || content.type === 'define') {
                this.webworker.worker.terminate();
                this.webworker.init();
            }
        } else {
            this.errStore.remove(content.func_name);
            if(this.waitingResult.has(content.func_name)) {
                Notify.success(content);
                this.waitingResult.delete(content.func_name);
            }
        }
    }
    selectCallback(tr, table, data){
        var trs = table.getElementsByTagName('tr');
        for(var _tr of trs){
            _tr.classList.remove('active');
        }
        tr.classList.add('active');

        if(data.type == 'system'){
            this.editing = data;
        } else {
            this.editing = this.datas[data.key];
        }

        this.editor.setValue(this.editing.code, 1);

        if (data.type === 'system') {
            $('#btn_editor_save').attr('disabled', true);
            $('#btn_editor_run').attr('disabled', true);
            this.editor.setReadOnly(true);
        } else {
            $('#btn_editor_save').attr('disabled', false);
            $('#btn_editor_run').attr('disabled', false);
            this.editor.setReadOnly(false);
        }
        this.editor.focus();
    }
    copyCallback(tr, data){
        let copy_i = 1;
        let name = data.name + '_' + copy_i;
        while (this.existIndicatorName(name)){
            copy_i++;
            name = data.name + '_' + copy_i;
        }
        let re = /^(function\s*\*\s*).*(\s*\(\s*C\s*\)\s*\{[\s\S]*\})$/g;
        let code = data.code.trim().replace(re, '$1' + name + '$2');
        let key = this.IndKeyManager.get();
        let path = this.cusFileHelper.dir + name + '.js';
        this.datas[key] = {
            key,
            name,
            path,
            type: 'custom',
            code,
        };
        this.webworker.register_indicator_class(name, path, code);
    }
    trashCallback(tr, data){
        this.$trashModal.find('#trash-indicator-name').text(data.name);
        this.$trashModal.dataSet = data;
        this.$trashModal.modal('show');
    }
    addNewIndicator (e){
        let copy_i = 1;
        let name = 'untitled';
        while (this.existIndicatorName(name)){
            name = 'untitled_' + copy_i++;
        }
        let code = this.codeTemplate.replace('${1:function_name}', name);
        let key = this.IndKeyManager.get();
        this.datas[key] = {
            key,
            name,
            path: this.cusFileHelper.dir + name + '.js',
            type: 'custom',
            code,
        };
    }
    trashIndicator (e){
        let deleting_ind = this.$trashModal.dataSet;
        delete this.datas[deleting_ind.key];
        // 关闭确认框
        this.$trashModal.modal('hide');
        // 通知webworker unregister_indicator_class
        this.webworker.unregister_indicator_class(deleting_ind.name);
    }
    saveIndicator (e){
        let old_name = this.editing.name;
        let code = this.editor.getSession().getValue().trim();
        let new_name = IndCtrl.checkCode(code, this.editor);
        if (new_name) {
            if(old_name !== new_name){
                if (this.existIndicatorName(new_name)){
                    Notify.error('指标名称重复!');
                    return;
                }
                // 通知webworker unregister_indicator_class
                this.webworker.unregister_indicator_class(old_name);
                this.cusFileHelper.del(old_name + '.js');
            }
            let path = this.cusFileHelper.dir + new_name + '.js';
            this.datas[this.editing.key] = {
                key: this.editing.key,
                name: new_name,
                path,
                type: 'custom',
                code,
            }
            this.editing = this.datas[this.editing.key];
            this.updateUI();
            this.webworker.register_indicator_class(new_name, path, code);
            this.waitingResult.add(new_name);

        }
        this.editor.focus();
    }
    updateUI () {
        for (let k in this.datas){
            let ind = this.datas[k];
            let tr = this.dom.find('tr.' + ind.key);
            if(tr.length == 0){
                tr = IndCtrl.getIndicatorTr(ind, {
                    select: this.selectCallback.bind(this),
                    trash: this.trashCallback.bind(this),
                });
                this.dom.append(tr);
            }else{
                tr.find('td:first').empty().append(ind.name);
            }
            if (this.errStore.has(ind.name)) {
                let timeout = IndCtrl.getBrandTag('错误', 'danger');
                this.dom.find('tr.' + k + ' td:first').append(timeout);
            }
        }
    };
    existIndicatorName (name) {
        // 检查 系统指标 和 用户自定义指标 是否有指标名称是 name
        for (let k in this.sys_datas)
            if (this.sys_datas[k].name === name) return true;
        for (let k in this.datas)
            if (this.datas[k].name === name) return true;
        return false;
    };
    /**
     * 静态方法
     */
    static registerIndicator(worker, indicators){
        if (indicators.name && indicators.code){
            worker.register_indicator_class(indicators.name, indicators.path, indicators.code);
        } else {
            for(var i in indicators){
                worker.register_indicator_class(indicators[i].name, indicators[i].path, indicators[i].code);
            }
        }
    }
    static checkCode(code, editor){
        // 检查代码是否符合规范，并返回 function name
        let reg = /^function\s*\*\s*(\S*)\s*\(\s*C\s*\)\s*\{([\s\S]*)\}\n*$/g;
        let result = reg.exec(code);
        if (result && result[0] === result.input) {
            if (!result[2].includes('yield')) {
                Notify.error('函数中返回使用 yield 关键字!');
                return false;
            } else if (editor) {
                let annotations = editor.getSession().getAnnotations();
                for (let i = 0; i < annotations.length; i++) {
                    if (annotations[i].type === 'error') {
                        Notify.error(annotations[i].row + ':' + annotations[i].colume + ' ' + annotations[i].text);
                        return false;
                    }
                }
                if(result[1]){
                    return result[1];
                } else {
                    Notify.error('指标名称不能为空');
                    return false;
                }
            }
        } else {
            Notify.error('代码不符合规范!');
            return false;
        }
    }
    static validVariableName (name) {
        // 匹配变量名的正则
        // 长度1-20，数字、字母、_、$ 组成，数字不能开头
        let regExp = /^[a-zA-Z\_\$][0-9a-zA-Z\_\$]{0,19}$/;
        return regExp.test(name);
    }
    static getBrandTag (text, label_class='danger') {
        let $d = $('<span></span>');
        $d.addClass('label label-brand label-' + label_class);
        $d.append(text);
        return $d;
    }
    static getIndicatorTr (data, callbacks) {
        function getIconBtn(type) {
            let $btn = $('<span class="glyphicon glyphicon-' + type + '"></span>');
            return ($('<td width="10%"></td>').append($btn));
        }

        let $tr = $('<tr class="' + data.key + '"></tr>');
        $tr.on('click', function (e) {
            let $tr = e.target.parentElement;
            if (e.target.parentElement.parentElement.nodeName === 'TR') {
                $tr = e.target.parentElement.parentElement;
            }
            let $table = $tr.parentElement.parentElement;
            callbacks.select($tr, $table, data);
        });
        $tr.append($('<td>' + data.name + '</td>'));
        if (data.type === 'system') {
            let copyBtn = getIconBtn('duplicate');
            copyBtn.on('click', function (e) {
                e.stopPropagation();
                callbacks.copy($tr, data);
            });
            return $tr.append(copyBtn);
        } else {
            let trashBtn = getIconBtn('trash');
            trashBtn.on('click', function (e) {
                e.stopPropagation();
                callbacks.trash($tr, data);
            });
            return $tr.append(trashBtn);
        }
    }
    static getTooltipColor(token) {
        if (token.type === 'constant.language.color') {
            return TqTooltips[token.type][token.value].toString();
        } else {
            return false;
        }
    }
    static getTooltipText (token) {
        return TqTooltips[token.type][token.value];
    }
    static updateTooltip (position, token) {
        //example with container creation via JS
        var div = document.getElementById('tooltip_0');
        if (div === null) {
            div = document.createElement('div');
            div.setAttribute('id', 'tooltip_0');
            div.setAttribute('class', 'seecoderun_tooltip'); // and make sure myclass has some styles in css
            document.body.appendChild(div);
        }

        div.style.display = 'block';
        div.style.left = position.pageX + 'px';
        div.style.top = position.pageY + 'px';
        div.style.visibility = 'hidden';

        var types = ['support.function.tianqin', 'constant.language.function'];
        if (token) {
            var color = IndCtrl.getTooltipColor(token);
            var typeIndex = types.indexOf(token.type);
            if (color) {
                div.style.backgroundColor = color;
                div.style.visibility = 'visible';
                div.innerText = '   ';
            } else {
                div.style.backgroundColor = '#FFFFFF';
                var text = IndCtrl.getTooltipText(token);
                if (text && text.length > 0) {
                    if (typeIndex > -1) text = text += ' (按住Ctrl单击打开链接)';
                    div.style.visibility = 'visible';
                    div.innerText = text;
                }
            }

        }
    }
}
class TqWebWorker {
    constructor (url, callbacks){
        this.url = url;
        this.worker = null;
        this.callbacks = callbacks;
        this.init();
    }
    init(){
        this.worker = new Worker(this.url);
        let _this = this;
        this.worker.addEventListener('message', function (e) {
            switch (e.data.cmd) {
                case 'websocket_reconnect':
                    _this.callbacks['websocket_reconnect'](e.data.content);
                    break;
                case 'calc_start':
                    _this.callbacks['calc_start'](e.data.content);
                    break;
                case 'calc_end':
                    _this.callbacks['calc_end'](e.data.content);
                    break;
                case 'feedback':
                    _this.callbacks['feedback'](e.data.content);
                    break;
                case 'error_all':
                    Notify.error('error in webworker \n' + content.type + ' : ' + content.message);
                default:
                    break;
            }
        });
    }
    post(cmd, content){
        if(this.worker) this.worker.postMessage({cmd, content});
    }
    register_indicator_class(name, path, code){
        this.post('register_indicator_class', {name, path, code});
    }
    unregister_indicator_class(name){
        this.post('unregister_indicator_class', name);
    }
    error_class_name(list){
        this.post('error_class_name', list);
    }
}
