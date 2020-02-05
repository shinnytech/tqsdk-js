const TQSDK = require('./dist/umd/tqsdk-nocache')
const WebSocket = require('ws')
const assert = require('assert')
const tqsdk = new TQSDK({}, { WebSocket })
const quote = tqsdk.getQuote('SHFE.au2006')
// const quote1 = tqsdk.getQuote('DCE.cs2006')
let quote2 = null
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
const chart = tqsdk.setChart({
  symbol: 'SHFE.au2006', duration: 60 * 1e9, view_width: 100
})
console.log('chart.state', chart.state)
tqsdk.on('ready', function () {
  assert.strictEqual(tqsdk.getQuote('SHFE.au2006').class, 'FUTURE')
  console.log(tqsdk.getQuote('SHFE.au2006').class)
  quote2 = tqsdk.getQuotesByInput('cs', { future_index: true, future_cont: true })
  console.log('doupo', quote2)
  console.log('SHFE.au2006 expire_datetime: ', tqsdk.getByPath(['quotes', 'SHFE.au2006', 'expire_datetime']))
})
tqsdk.on('rtn_brokers', function (brokers) {
  tqsdk.addAccount(account)
  tqsdk.addAccount({ bid: '快期模拟', user_id: 'test1231', password: '123456' })
  tqsdk.login(account)
  console.log(tqsdk.getAllAccounts())
})
const order = null

tqsdk.on('rtn_data', function () {
  if (tqsdk.isChanging(['quotes', 'SHFE.au2006'])) {
    console.log(quote.datetime, quote.last_price, quote.volume)
  } else {
    console.log('no change')
  }
  console.log('chart.right_id', chart && chart.right_id)

  // console.log('ins_list:', tqsdk.dm._data.ins_list)
  // console.log(quote.py, quote.class, quote.last_price, quote.ask_price1, quote.pre_settlement)
  /// ////// 交易相关
  console.log('test123 isLogined:', tqsdk.isLogined(account))
  // console.log('test1234 isLogined:', tqsdk.isLogined({ bid: '快期模拟', user_id: 'test1234' }))
  if (!tqsdk.isLogined(account)) return
  // tqsdk.confirmSettlement(account)
  if (order === null) {
    // insertOrder
    // order = tqsdk.insertOrder(Object.assign({
    //   exchange_id: 'SHFE',
    //   instrument_id: 'au2006',
    //   direction: 'SELL',
    //   offset: 'CLOSETODAY',
    //   price_type: 'LIMIT',
    //   limit_price: 359.62,
    //   volume: 2
    // }, account))

    // cancelOrder
    // tqsdk.cancelOrder(Object.assign({
    //   order_id: order.order_id
    // }, account))

    // autoInsertOrder
    // order = tqsdk.autoInsertOrder(Object.assign({
    //   exchange_id: 'SHFE',
    //   instrument_id: 'au2006',
    //   direction: 'SELL',
    //   offset: 'CLOSE',
    //   price_type: 'LIMIT',
    //   limit_price: 339.62,
    //   volume: 2
    // }, account))
    // if (Array.isArray(order)) { order = order[0] }
    // console.log(order.order_id, order.status, order.volume_left)
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
console.log(tqsdk._insUrl, tqsdk._mdUrl)
