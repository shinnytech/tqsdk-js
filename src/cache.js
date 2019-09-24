import * as project_package from '../package.json'
const DB_NAME = 'his_settlements';
let stores = {};
let version = project_package.db_version
let localForage = {}

if (location.protocol === 'data:') {
  let _datas = {}
  localForage.createInstance = function ({
                                           name,
                                           storeName
                                         } = {}) {
    _datas[storeName] = _datas[storeName] || {}
    stores[storeName] = {
      getItem: (k) => _datas[storeName][k] || '',
      setItem: (k, v) => {
        _datas[storeName][k] = v
      }
    }
  }
} else {
  import("localforage").then(function(module){
    localForage = module
    let old_version = localStorage.getItem('cc_db_ver')
    if (old_version != version) {
      // 数据库版本升级，整个数据库重置
      let DBDeleteRequest = indexedDB.deleteDatabase(DB_NAME);
      DBDeleteRequest.onerror = function(event) {
        console.log("Error deleting database.");
      };
      DBDeleteRequest.onsuccess = function(event) {
        localStorage.setItem('cc_db_ver', version)
      };
    }
  })
}

export default {
  getContent(user_id, trading_day){
    if(stores[user_id] === undefined) {
      stores[user_id] = localForage.createInstance({
        name: DB_NAME,
        storeName: user_id
      })
    }
    return stores[user_id].getItem(String(trading_day))
  },
  setContent(user_id, trading_day, content){
    if(stores[user_id] === undefined) {
      stores[user_id] = localForage.createInstance({
        name: DB_NAME,
        storeName: user_id
      })
    }
    return stores[user_id].setItem(String(trading_day), content)
  }
}
