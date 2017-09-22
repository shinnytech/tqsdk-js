var IStore = function () {
    var db;
    var storeName = 'indicators';

    function init() {
        return new Promise((resolve, reject) => {
            var openRequest = window.indexedDB.open("TQApp", 5);
            openRequest.onupgradeneeded = function (e) {
                console.log('onupgradeneeded', e)
                db = e.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    var store = db.createObjectStore(storeName, {
                        autoIncrement: true
                    });
                    store.createIndex("name", "name", {unique: true});
                }
            }
            openRequest.onsuccess = function (e) {
                db = e.target.result;
                resolve('success');
            }
            openRequest.onerror = function (e) {
                // console.dir("打开数据库时发生error:", e);
                reject('failed', e);
            }
            openRequest.blocked = function (e) {
                // console.log('上一次的数据库连接还未关闭', e);
                reject('blocked', e);
            }
        });
    }

    function getNow() {
        return (new Date()).getTime();
    }

    function getObjectStore(mode) {
        var transaction = db.transaction([storeName], mode);
        transaction.oncomplete = function (event) {
            // console.log('complete', event)
        };
        transaction.onabort = function (event) {
            // console.log('abort', event)
        };
        transaction.onerror = function (event) {
            // console.log('error', event)
        };
        return transaction.objectStore(storeName);
    }

    function getIndicators() {
        var store = getObjectStore('readonly');
        return new Promise((resolve, reject) => {
            var request = store.getAllKeys();
            request.onerror = function (e) {
                reject(e.target.error.name);
            }
            request.onsuccess = function (e) {
                var promiseList = [];
                for (var i = 0; i < e.target.result.length; i++) {
                    promiseList.push(getIndicator(e.target.result[i]));
                }
                Promise.all(promiseList).then(values => {
                    resolve(values);
                });
            }
        });
    }

    function getIndicator(key) {
        var store = getObjectStore('readonly');
        return new Promise((resolve, reject) => {
            var request = store.get(key);
            request.onerror = function (e) {
                reject(e.target.error.name);
            }
            request.onsuccess = function (e) {
                if (e.target.result != undefined) {
                    e.target.result.key = key;
                }
                resolve(e.target.result);
            }
        });
    }

    function addIndicator(indicator) {
        var store = getObjectStore('readwrite');
        var dt = getNow();
        var indicator_obj = {
            name: indicator.name,
            type: indicator.type,
            draft: {
                dt: dt,
                code: ""
            },
            final: {
                dt: dt,
                code: ""
            },
            prop: '',
            params: {}
        }
        // prop: indicator.prop,
        //     params: indicator.params
        if (indicator.draft && indicator.draft.code) {
            indicator_obj.draft.code = indicator.draft.code;
            indicator_obj.final.code = indicator.draft.code;
        }
        if (indicator.prop) {
            indicator_obj.prop = indicator.prop;
        }
        if (indicator.params) {
            indicator_obj.params = indicator.params;
        }
        return new Promise((resolve, reject) => {
            var request = store.add(indicator_obj);
            request.onerror = function (e) {
                reject(e.target.error.name);
            }
            request.onsuccess = function (e) {
                resolve(getIndicator(e.target.result));
            }
        });
    }

    function removeIndicator(key) {
        var store = getObjectStore('readwrite');
        return new Promise((resolve, reject) => {
            var request = store.delete(key);
            request.onerror = function (e) {
                reject(e.target.error.name);
            }
            request.onsuccess = function (e) {
                resolve(e.type);
            }
        });
    }

    function save(key, indicator) {
        var store = getObjectStore('readwrite');
        return new Promise((resolve, reject) => {
            var request = store.put(indicator, key);
            request.onerror = function (e) {
                reject(e.target.error.name);
            }
            request.onsuccess = function (e) {
                indicator.key = e.target.result;
                resolve(indicator);
            }
        });
    }

    function saveDraft(indicator_custom) {
        return new Promise((resolve, reject) => {
                getIndicator(indicator_custom.key).then((indicator) => {
                    var indicator_obj = {
                        name: indicator_custom.name,
                        type: indicator.type,
                        draft: {
                            dt: getNow(),
                            code: (indicator_custom.draft && indicator_custom.draft.code) ? indicator_custom.draft.code : indicator.draft.code
                        },
                        final: {
                            dt: indicator.final.dt,
                            code: indicator.final.code
                        },
                        prop: indicator_custom.prop,
                        params: indicator_custom.params
                    };
                    resolve(save(indicator_custom.key, indicator_obj));
                })
            }
        );
    }

    function saveFinal(indicator_custom) {
        return new Promise((resolve, reject) => {
                getIndicator(indicator_custom.key).then(function (indicator) {
                    var dt = getNow();
                    var indicator_obj = {
                        name: indicator_custom.name,
                        type: indicator.type,
                        draft: {
                            dt: dt,
                            code: indicator_custom.draft.code
                        },
                        final: {
                            dt: dt,
                            code: indicator_custom.draft.code
                        },
                        prop: indicator_custom.prop,
                        params: indicator_custom.params
                    }
                    resolve(save(indicator_custom.key, indicator_obj));
                })
            }
        );
    }

    function resetIndicator(key) {
        var store = getObjectStore('readwrite');
        return new Promise((resolve, reject) => {
                getIndicator(key).then(function (indicator) {
                    var indicator_obj = {
                        name: indicator.name,
                        type: indicator.type,
                        draft: {
                            dt: indicator.final.dt,
                            code: indicator.final.code
                        },
                        final: {
                            dt: indicator.final.dt,
                            code: indicator.final.code
                        },
                        prop: indicator.prop,
                        params: indicator.params
                    }
                    resolve(save(key, indicator_obj));
                })
            }
        );
    }

    return {
        init: init,
        getAll: getIndicators,
        getByKey: getIndicator,
        add: addIndicator,
        saveDraft: saveDraft,
        saveFinal: saveFinal,
        reset: resetIndicator,
        remove: removeIndicator
    }
}();

// Keys
function* GenerateKey() {
    var i = 0;
    while (true) {
        yield i.toString(36);
        i++;
    }
}
const Keys = GenerateKey();

/*
 * =========== ErrorHandlers ===================
 */
var ErrorHandlers = function() {
    var errorKey = 'tq_error';
    var init = function(){
        if(localStorage.getItem(errorKey) === null){
            localStorage.setItem(errorKey, '');
        }
    };
    var add = function(name){
        var list = [];
        if(localStorage.getItem(errorKey) !== ''){
            list = localStorage.getItem(errorKey).split(',');
        }
        if(list.indexOf(name) === -1){
            list.push(name);
            localStorage.setItem(errorKey, list.join(','));
        }
        worker.postMessage({cmd: 'error_class_name', content: list});
        return list;
    }
    var remove = function(name){
        var list = [];
        if(localStorage.getItem(errorKey) !== ''){
            list = localStorage.getItem(errorKey).split(',');
        }
        if(list.indexOf(name) > -1){
            list.splice(list.indexOf(name), 1);
            localStorage.setItem(errorKey, list);
        }
        worker.postMessage({cmd: 'error_class_name', content: list});
        return list;
    }
    var has = function(name){
        if(localStorage.getItem(errorKey) === ''){
            return false;
        }
        var list = localStorage.getItem(errorKey).split(',')
        return list.indexOf(name) > -1;
    }
    var get = function(){
        if(localStorage.getItem(errorKey) === ''){
            return [];
        }
        return localStorage.getItem(errorKey).split(',');
    }
    var clear = function (){
        localStorage.setItem(errorKey, '');
    }
    return {
        records: {},
        init: init,
        add: add,
        has: has,
        remove: remove,
        get: get,
        clear: clear
    }
}();
ErrorHandlers.init();

/*
 * =========== Notification ===================
 * Notify
 *    "success",
 *    "err", "error",
 *    "warn", "warning",
 *    "info", "information",
 *    "noty", "notification"
 */
const Notify = function () {
    var debug = false;

    var defaults = {
        layout: 'topRight',
        theme: 'relax',// defaultTheme, relax, bootstrapTheme, metroui
        type: 'information',
        force: true,
        timeout: 2000,
        maxVisible: 50,
        closeWith: ['click', 'button']
    };

    function getNotyFun(type) {
        if(!debug){
            return function (text) {
                return noty(Object.assign(defaults, {text, type}));
            }
        }else{
            return function(text){
                return console.log('%c%s', 'color: #7C37D4', type + ' : ' + text);
            }
        }
    }

    let notys = {};
    notys.success = getNotyFun('success');
    notys.error = notys.err = getNotyFun('error');
    notys.warning = notys.warn = getNotyFun('warning');
    notys.information = notys.info = getNotyFun('information');
    notys.notification = notys.noty = getNotyFun('notification');
    return notys;
}();

/*
 * webworker 返回的信息格式
 */
var TqFeedback = function(e){
    this.error = e.error; // true | false
    this.type = e.type; // define | run
    this.message = e.message;
    this.func_name = e.func_name;
}
TqFeedback.prototype.toString = function(){
    return this.func_name + ' #' + this.type + '\n' + this.message;
}