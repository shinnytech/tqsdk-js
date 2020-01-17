// import "regenerator-runtime/runtime";
import 'core-js/stable/set-immediate'
import { version, db_version as dbVersion } from './package.json'
import axios from 'axios'
import TQSDK from './src/index'
import { TqWebsocket } from './src/tqwebsocket'
import DataManager from './src/datamanage'
import localforage from 'localforage'
TQSDK.axios = axios
TQSDK.TqWebsocket = TqWebsocket
TQSDK.TQData = DataManager
TQSDK.version = version

// store with db
const DB_NAME = 'his_settlements'
const stores = {}
const oldVersion = localStorage.getItem('cc_db_ver')
if (oldVersion !== dbVersion) {
  // 数据库版本升级，整个数据库重置
  const DBDeleteRequest = indexedDB.deleteDatabase(DB_NAME)
  DBDeleteRequest.onerror = function (event) {
    console.log('Error deleting database.')
  }
  DBDeleteRequest.onsuccess = function (event) {
    localStorage.setItem('cc_db_ver', dbVersion)
  }
}

TQSDK.store = {
  getContent (userId, tradingDay) {
    if (stores[userId] === undefined) {
      stores[userId] = localforage.createInstance({
        name: DB_NAME,
        storeName: userId
      })
    }
    return stores[userId].getItem(String(tradingDay))
  },
  setContent (userId, tradingDay, content) {
    if (stores[userId] === undefined) {
      stores[userId] = localforage.createInstance({
        name: DB_NAME,
        storeName: userId
      })
    }
    return stores[userId].setItem(String(tradingDay), content)
  }
}

export default TQSDK
