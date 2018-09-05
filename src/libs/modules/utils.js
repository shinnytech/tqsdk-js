// 系统常量
const ICON_BUY = 1;
const ICON_SELL = 2;
const ICON_BLOCK = 3;
const IsBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document);
const IsWebWorker = !IsBrowser && typeof importScripts !== 'undefined';
const IsTest = !( IsBrowser || IsWebWorker);

/**
 * 返回指定变量的数据类型
 * @param  {Any} data
 * @return {String} Array Object Generator Function String Number Null Undefined Boolean
 */
function type (data){
    return Object.prototype.toString.call(data).slice(8, -1);
}

/**
 * 生成指定长度的随机字符串
 * 默认长度为 8
 */
function RandomStr (len = 8) {
    var charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var s = '';
    for (var i = 0; i < len; i++) s += charts[Math.random() * 0x3e | 0];
    return s;
}

/**
 * 生成序列生成器
 * 默认从 0 开始
 */
function* GenerateSequence(start = 0) {
    while (true) {
        yield start.toString(36);
        start++;
    }
}

/**
 * 解析字符串，读取交易所和交易代码
 */
function ParseSymbol(str) {
    var match_arr = str.match(/([^\.]+)\.(.*)/);
    return {
        exchange_id: match_arr ? match_arr[1] : '',// 交易所代码
        instrument_id: match_arr ? match_arr[2] : ''// 合约代码
    }
}

/**
 * 深度比较两个对象是否相同
 * @param x
 * @param y
 * @returns {boolean}
 */
Object.equals = function(x, y){
    if (!(x instanceof Object && y instanceof Object)){
        return x == y;
    }
    for (let p in y) {
        if (!x.hasOwnProperty(p)) return false;
    }
    for (let p in x) {
        if (!y.hasOwnProperty(p)) return false;
        if (typeof y[p] != typeof x[p]) return false;
        if (!Object.equals(x[p], y[p])) return false;
    }
    return true;
}

function getobj(obj, ...path){
    let node = obj;
    for (let i = 0; i < path.length; i++) {
        if (! (path[i] in node))
            return undefined;
        node = node[path[i]];
    }
    return node;
}

class Store {
    constructor(StoreKey){
        this.key = StoreKey;
        this.data = {};
        if (localStorage.getItem(this.key) === null){
            localStorage.setItem(this.key, "{}");
        } else {
            this.data = JSON.parse(localStorage.getItem(this.key));
        }
    }
    set(key, value){
        this.data[key] = value;
        localStorage.setItem(this.key, JSON.stringify(this.data));
    }
    get(key){
        return this.data[key];
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
