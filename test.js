const TQSDK = require('./dist/umd/tqsdk-nocache')
const WebSocket = require('ws')
const assert = require('assert')
const tqsdk = new TQSDK({}, { WebSocket })

const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }

tqsdk.on('ready', function () {
  assert.strictEqual(tqsdk.getQuote('SHFE.au2006').class, 'FUTURE')
  console.log(tqsdk.getQuote('SHFE.au2006').class)
})
tqsdk.on('rtn_brokers', function (brokers) {
  tqsdk.addAccount(account)
  tqsdk.login(account)
})
let order = null
tqsdk.on('rtn_data', function () {
  console.log('test123 isLogined:', tqsdk.isLogined(account))
  // console.log('test1234 isLogined:', tqsdk.isLogined({ bid: '快期模拟', user_id: 'test1234' }))
  if (!tqsdk.isLogined(account)) return
  tqsdk.confirmSettlement(account)
  if (order === null) {
    // order = tqsdk.insertOrder(Object.assign({
    //   exchange_id: 'SHFE',
    //   instrument_id: 'au2006',
    //   direction: 'SELL',
    //   offset: 'CLOSETODAY',
    //   price_type: 'LIMIT',
    //   limit_price: 359.62,
    //   volume: 2
    // }, account))

    // tqsdk.cancelOrder(Object.assign({
    //   order_id: order.order_id
    // }, account))

    order = tqsdk.autoInsertOrder(Object.assign({
      exchange_id: 'SHFE',
      instrument_id: 'au2006',
      direction: 'SELL',
      offset: 'CLOSE',
      price_type: 'LIMIT',
      limit_price: 339.62,
      volume: 2
    }, account))
    if (Array.isArray(order)) { order = order[0] }
    console.log(order.order_id, order.status, order.volume_left)
  }

  // get 各种账户信息
  // console.log(tqsdk.getAccount(account))
  // tqsdk.getTrades -----------
  // console.log(tqsdk.getTrades(account))
  // console.log(tqsdk.getTrade(Object.assign({ trade_id: 22 }, account)))
  // console.log(tqsdk.getTradesByOrder(Object.assign({ order_id: 'TQJS_yc1UevCG' }, account)))
  // console.log(tqsdk.getTradesBySymbol(Object.assign({ symbol: 'SHFE.au2006' }, account)))
  // tqsdk.getOrders -----------
  // console.log(tqsdk.getOrders(account))
  // console.log(tqsdk.getOrder(Object.assign({ order_id: 'TQJS_yc1UevCG' }, account)))
  // console.log(tqsdk.getOrdersBySymbol(Object.assign({ symbol: 'SHFE.au2006' }, account)))
  // tqsdk.getPositions -----------
  // console.log(tqsdk.getPositions(account))
  // console.log(tqsdk.getPosition(Object.assign({ symbol: 'SHFE.au2006' }, account)))
})
tqsdk.on('notify', function (notify) {
  console.log(`notify (${notify.level}): ${notify.bid},${notify.user_id} -- ${notify.content}`)
})
console.log(tqsdk._insUrl)
