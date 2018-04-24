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
