/*
 * =========== Notification ===================
 * Notify
 *    "success",
 *    "err", "error",
 *    "warn", "warning",
 *    "info", "information",
 *    "noty", "notification"
 */
class COLOR {
    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    toString() {
        return '#' + this.r.toString(16).padStart(2, '0') + this.g.toString(16).padStart(2, '0') + this.b.toString(16).padStart(2, '0');
    }
}
class Store {
    constructor (key){
        this.key = key;
        this.init();
    }
    init(){
        if (localStorage.getItem(this.key) === null)
            localStorage.setItem(this.key, "{}");
    }
    save(obj){
        obj = JSON.stringify(obj);
        localStorage.setItem(this.key, obj);
        return obj;
    }
    get(){
        return JSON.parse(localStorage.getItem(this.key));
    }
    remove(){
        localStorage.removeItem(this.key);
    }
}
class ErrorStore{
    constructor (key, webworker){
        this.key = key;
        this.errClassList = [];
        this.records = {};
        this.init();
        this.webworker = webworker;
    }
    init(){
        let item = localStorage.getItem(this.key);
        if (item === null){
            localStorage.setItem(this.key, "");
            this.errClassList = [];
        }else{
            this.errClassList = item.split(',');
        }
    }
    add(name){
        if (this.errClassList.indexOf(name) === -1) {
            this.errClassList.push(name);
            localStorage.setItem(this.key, this.errClassList.join(','));
            this.webworker.error_class_name(this.errClassList);
            return this.errClassList;
        }
    }
    remove(name){
        if (this.errClassList.indexOf(name) > -1) {
            this.errClassList.splice(this.errClassList.indexOf(name), 1);
            localStorage.setItem(this.key, this.errClassList.join(','));
            this.webworker.error_class_name(this.errClassList);
            return this.errClassList;
        }
    }
    has(name) {
        return this.errClassList.indexOf(name) > -1;
    }
    get(){
        return this.errClassList;
    }
    clear() {
        localStorage.setItem(this.key, '');
        this.errClassList = [];
        return this.errClassList;
    }
}
const Notify = (function () {
    let debug = false;

    let defaults = {
        layout: 'topRight',
        theme: 'relax',// defaultTheme, relax, bootstrapTheme, metroui
        type: 'information',
        force: true,
        timeout: 2000,
        maxVisible: 50,
        closeWith: ['click', 'button'],
    };

    function getNotyFun(type) {
        if (!debug) {
            return function (content) {
                var text = null;
                if (typeof content == 'string'){
                    text = content;
                } else {
                    /**
                     * content = {
                     *      error: true, // true | false
                     *      type: 'define', // define | run
                     *      message: 'xxxxxxxxxxxx',
                     *      func_name: 'ma'
                     * }
                     */
                    text = `函数 ${content.func_name} 运行`;
                    text += type == 'error' ? `失败，<br/>错误内容: ${content.message}` : '成功！';
                }
                return noty(Object.assign(defaults, { text, type }));
            };
        } else {
            return function (text) {
                return console.log('%c%s', 'color: #7C37D4', type + ' : ' + text);
            };
        }
    }

    let notys = {};
    notys.success = getNotyFun('success');
    notys.error = notys.err = getNotyFun('error');
    notys.warning = notys.warn = getNotyFun('warning');
    notys.information = notys.info = getNotyFun('information');
    notys.notification = notys.noty = getNotyFun('notification');
    return notys;
}());
const TqTooltips = {
    'support.function.tianqin': {
        DEFINE: '定义技术指标属性',
        PARAM: '定义指标参数',
        SERIAL: '定义输入序列',
        OUTS: '定义输出序列',
    },
    'constant.language.context': {
        C: '系统核心函数提供者',
    },
    'constant.language.color': {
        RED: new COLOR(0xFF, 0, 0),
        GREEN: new COLOR(0, 0xFF, 0),
        BLUE: new COLOR(0, 0, 0xFF),
        CYAN: new COLOR(0, 0xFF, 0xFF),
        BLACK: new COLOR(0, 0, 0),
        WHITE: new COLOR(0xFF, 0xFF, 0xFF),
        GRAY: new COLOR(0x80, 0x80, 0x80),
        MAGENTA: new COLOR(0xFF, 0, 0xFF),
        YELLOW: new COLOR(0xFF, 0xFF, 0),
        LIGHTGRAY: new COLOR(0xD3, 0xD3, 0xD3),
        LIGHTRED: new COLOR(0xF0, 0x80, 0x80),
        LIGHTGREEN: new COLOR(0x90, 0xEE, 0x90),
        LIGHTBLUE: new COLOR(0x8C, 0xCE, 0xFA),
    },
    'constant.language.function': {
        MA: '求一个序列中连续N项的平均值',
        STDEV: '求一个序列中连续N项的标准差',
        SUM: '求一个序列中连续N项的和',
    },
    'support.keyword.tianqin': {
        PARAMS: '参数对象',
        OUTS: '定义输出序列',
        cname: '可选，指定技术指标的中文名称。默认为技术指标名',
        type: '必填，“MAIN” 或 “SUB”, MAIN=主图技术指标, SUB=副图技术指标',
        state: '必填，“KLINE” 或 “TICK”',
        color: '设置颜色',
        memo: '可选，设定此技术指标的文字说明。',
        yaxis: '可选, 描述此指标所需要使用的Y坐标轴',
    },
};

