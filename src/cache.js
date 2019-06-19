import localForage from "localforage"
const DB_NAME = 'his_settlements';
let stores = {};

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
