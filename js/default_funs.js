var IStore = function () {
    var db;
    var storeName = 'indicators';

    function init() {
        return new Promise((resolve, reject) => {
            var openRequest = window.indexedDB.open("TQApp", 4);
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
            type: "custom",
            memo: indicator.memo,
            draft: {
                dt: dt,
                code: ""
            },
            final: {
                dt: dt,
                code: ""
            }
        }
        if (indicator.draft && indicator.draft.code) {
            indicator_obj.draft.code = indicator.draft.code;
            indicator_obj.final.code = indicator.draft.code;
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
                        type: "custom",
                        memo: indicator_custom.memo,
                        draft: {
                            dt: getNow(),
                            code: (indicator_custom.draft && indicator_custom.draft.code) ? indicator_custom.draft.code : indicator.draft.code
                        },
                        final: {
                            dt: indicator.final.dt,
                            code: indicator.final.code
                        }
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
                        type: "custom",
                        memo: indicator_custom.memo,
                        draft: {
                            dt: dt,
                            code: indicator_custom.draft.code
                        },
                        final: {
                            dt: dt,
                            code: indicator_custom.draft.code
                        }
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
                        type: "custom",
                        memo: indicator.memo,
                        draft: {
                            dt: indicator.final.dt,
                            code: indicator.final.code
                        },
                        final: {
                            dt: indicator.final.dt,
                            code: indicator.final.code
                        }
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

// IStore.init().then(function (s) {
// IStore.getAll().then(function (list) {
//     console.log(list);
// }, function (e) {
//     console.log(e);
// });

// IStore.add({
//     name: "MACC",
//     memo: "yyyyyyyyy",
//     final: {},
//     draft: {
//         code: "function (){console.log('this is ma')}"
//     }
// }).then(function(i){
//     console.log(i);
// }, function(e){
//     if(e == 'ConstraintError'){
//         console.log('指标名称重复')
//     }else{
//         console.log(e);
//     }
// });

// IStore.add({
//     name: "MA0",
//     memo: "yyyyyyyyy",
// }).then(function(i){
//     console.log(i);
// }, function(e){
//     if(e == 'ConstraintError'){
//         console.log('指标名称重复')
//     }else{
//         console.log(e);
//     }
// });

// IStore.remove(2).then(function (i) {
//
//     IStore.getAll().then(function (list) {
//         console.log(list);
//     }, function (e) {
//         console.log(e);
//     });
// }, function (e) {
//     console.log(e); // 删除不存在的不会报错
// });

// IStore.saveDraft({
//     key: 19,
//     name: "MA",
//     memo: "000000000",
//     draft: {
//         code: "function (){console.log('this is ma20000003')}"
//     }
// }).then(function (i) {
//     console.log(i);
// }, function (e) {
//     console.log(e);
// });

// IStore.saveFinal({
//     key: 19,
//     name: "MA",
//     memo: "000000000",
//     draft: {
//         code: "function (){console.log('this is ma23')}"
//     }
// }).then(function (i) {
//     console.log(i);
// }, function (e) {
//     console.log(e);
// });

// IStore.reset(19).then(function (i) {
//     console.log(i);
// }, function (e) {
//     console.log(e);
// });

// });
