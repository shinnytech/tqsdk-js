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
