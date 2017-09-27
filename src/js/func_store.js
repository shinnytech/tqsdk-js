const IStore = (function () {
    let db;
    let storeName = 'indicators';

    function init() {
        return new Promise((resolve, reject) => {
            let openRequest = window.indexedDB.open('TQApp', 5);
            openRequest.onupgradeneeded = function (e) {
                console.log('onupgradeneeded', e);
                db = e.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    let store = db.createObjectStore(storeName, {
                        autoIncrement: true,
                    });
                    store.createIndex('name', 'name', { unique: true });
                }
            };

            openRequest.onsuccess = function (e) {
                db = e.target.result;
                resolve('success');
            };

            openRequest.onerror = function (e) {
                // console.dir("打开数据库时发生error:", e);
                reject('failed', e);
            };

            openRequest.blocked = function (e) {
                // console.log('上一次的数据库连接还未关闭', e);
                reject('blocked', e);
            };
        });
    }

    function getNow() {
        return (new Date()).getTime();
    }

    function getObjectStore(mode) {
        let transaction = db.transaction([storeName], mode);
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
        let store = getObjectStore('readonly');
        return new Promise((resolve, reject) => {
            let request = store.getAllKeys();
            request.onerror = function (e) {
                reject(e.target.error.name);
            };

            request.onsuccess = function (e) {
                let promiseList = [];
                for (let i = 0; i < e.target.result.length; i++) {
                    promiseList.push(getIndicator(e.target.result[i]));
                }

                Promise.all(promiseList).then(values => {
                    resolve(values);
                });
            };
        });
    }

    function getIndicator(key) {
        let store = getObjectStore('readonly');
        return new Promise((resolve, reject) => {
            let request = store.get(key);
            request.onerror = function (e) {
                reject(e.target.error.name);
            };

            request.onsuccess = function (e) {
                if (e.target.result !== undefined) {
                    e.target.result.key = key;
                }

                resolve(e.target.result);
            };
        });
    }

    function addIndicator(indicator) {
        let store = getObjectStore('readwrite');
        let dt = getNow();
        let indicatorObj = {
            name: indicator.name,
            type: indicator.type,
            draft: {
                dt: dt,
                code: '',
            },
            final: {
                dt: dt,
                code: '',
            },
            prop: '',
            params: {},
        };

        // prop: indicator.prop,
        //     params: indicator.params
        if (indicator.draft && indicator.draft.code) {
            indicatorObj.draft.code = indicator.draft.code;
            indicatorObj.final.code = indicator.draft.code;
        }

        if (indicator.prop) {
            indicatorObj.prop = indicator.prop;
        }

        if (indicator.params) {
            indicatorObj.params = indicator.params;
        }

        return new Promise((resolve, reject) => {
            let request = store.add(indicatorObj);
            request.onerror = function (e) {
                reject(e.target.error.name);
            };

            request.onsuccess = function (e) {
                resolve(getIndicator(e.target.result));
            };
        });
    }

    function removeIndicator(key) {
        let store = getObjectStore('readwrite');
        return new Promise((resolve, reject) => {
            let request = store.delete(key);
            request.onerror = function (e) {
                reject(e.target.error.name);
            };

            request.onsuccess = function (e) {
                resolve(e.type);
            };
        });
    }

    function save(key, indicator) {
        let store = getObjectStore('readwrite');
        return new Promise((resolve, reject) => {
            let request = store.put(indicator, key);
            request.onerror = function (e) {
                reject(e.target.error.name);
            };

            request.onsuccess = function (e) {
                indicator.key = e.target.result;
                resolve(indicator);
            };
        });
    }

    function saveDraft(indicatorCustom) {
        return new Promise((resolve, reject) => {
                getIndicator(indicatorCustom.key).then((indicator) => {
                    let indicatorObj = {
                        name: indicatorCustom.name,
                        type: indicator.type,
                        draft: {
                            dt: getNow(),
                            code: (indicatorCustom.draft && indicatorCustom.draft.code) ?
                                indicatorCustom.draft.code : indicator.draft.code,
                        },
                        final: {
                            dt: indicator.final.dt,
                            code: indicator.final.code,
                        },
                        prop: indicatorCustom.prop,
                        params: indicatorCustom.params,
                    };
                    resolve(save(indicatorCustom.key, indicatorObj));
                });
            }
        );
    }

    function saveFinal(indicatorCustom) {
        return new Promise((resolve, reject) => {
                getIndicator(indicatorCustom.key).then(function (indicator) {
                    let dt = getNow();
                    let indicatorObj = {
                        name: indicatorCustom.name,
                        type: indicator.type,
                        draft: {
                            dt: dt,
                            code: indicatorCustom.draft.code,
                        },
                        final: {
                            dt: dt,
                            code: indicatorCustom.draft.code,
                        },
                        prop: indicatorCustom.prop,
                        params: indicatorCustom.params,
                    };
                    resolve(save(indicatorCustom.key, indicatorObj));
                });
            }
        );
    }

    function resetIndicator(key) {
        return new Promise((resolve, reject) => {
                getIndicator(key).then(function (indicator) {
                    let indicatorObj = {
                        name: indicator.name,
                        type: indicator.type,
                        draft: {
                            dt: indicator.final.dt,
                            code: indicator.final.code,
                        },
                        final: {
                            dt: indicator.final.dt,
                            code: indicator.final.code,
                        },
                        prop: indicator.prop,
                        params: indicator.params,
                    };
                    resolve(save(key, indicatorObj));
                });
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
        remove: removeIndicator,
    };
}());

/*
 * =========== ErrorHandlers ===================
 */
const ErrorHandlers = (function () {
    let errorKey = 'tq_error';
    let init = function () {
        if (localStorage.getItem(errorKey) === null) {
            localStorage.setItem(errorKey, '');
        }
    };

    let add = function (name) {
        let list = [];
        if (localStorage.getItem(errorKey) !== '') {
            list = localStorage.getItem(errorKey).split(',');
        }

        // 系统函数不记录错误
        for (let i = 0; i < CMenu.sys_datas.length; i++) {
            if (name === CMenu.sys_datas[i].name) {
                return list;
            }
        }

        if (list.indexOf(name) === -1) {
            list.push(name);
            localStorage.setItem(errorKey, list.join(','));
        }

        worker.postMessage({ cmd: 'error_class_name', content: list });
        return list;
    };

    let remove = function (name) {
        let list = [];
        if (localStorage.getItem(errorKey) !== '') {
            list = localStorage.getItem(errorKey).split(',');
        }

        if (list.indexOf(name) > -1) {
            list.splice(list.indexOf(name), 1);
            localStorage.setItem(errorKey, list);
        }

        worker.postMessage({ cmd: 'error_class_name', content: list });
        return list;
    };

    let has = function (name) {
        if (localStorage.getItem(errorKey) === '') {
            return false;
        }

        let list = localStorage.getItem(errorKey).split(',');
        return list.indexOf(name) > -1;
    };

    let get = function () {
        if (localStorage.getItem(errorKey) === '') {
            return [];
        }

        return localStorage.getItem(errorKey).split(',');
    };

    let clear = function () {
        localStorage.setItem(errorKey, '');
    };

    return {
        records: {},
        init: init,
        add: add,
        has: has,
        remove: remove,
        get: get,
        clear: clear,
    };
}());

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
            return function (text) {
                return noty(Object.assign(defaults, {text, type}));
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

/*
 * webworker 返回的信息格式
 */
const TqFeedback = function (e) {
    this.error = e.error; // true | false
    this.type = e.type; // define | run
    this.message = e.message;
    this.func_name = e.func_name;
};

TqFeedback.prototype.toString = function () {
    return this.func_name + ' #' + this.type + '\n' + this.message;
};
