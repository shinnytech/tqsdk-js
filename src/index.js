import TqWebsocket from './tqwebsocket'
import Datamanager from './datamanage'
import EventPrototype from './event'
import { RandomStr } from './utils'

/**
 * 事件类型
 + ready: 收到合约基础数据（全局只出发一次）
 + rtn_brokers: 收到期货公司列表
 + notify: 收到通知对象
 + rtn_data: 数据更新（每一次数据更新触发）
 + error: 发生错误(目前只有一种：合约服务下载失败)
 */


class TQSDK extends EventPrototype{
  constructor({
                symbolsServerUrl = 'https://openmd.shinnytech.com/t/md/symbols/latest.json',
                wsQuoteUrl = 'wss://openmd.shinnytech.com/t/md/front/mobile',
                wsTradeUrl = 'wss://t.shinnytech.com/trade/shinny',
                reconnectInterval = 3000,
                reconnectMaxTimes = 5,
                prefix = '',
                needsQuotesService = true
  } = {}) {
    super()
    this.version = __VERSION__
    this._symbol_services_url = symbolsServerUrl
    this._prefix = 'TQJS_' + (prefix ? prefix + '_' : '')

    this.brokers = null

    this.login_user_id = '' // 用户填写的登录 user_id
    this.login_bid = ''
    this.login_password = ''

    // 合约服务已经准备就绪
    this.isQuotesInfoReady = needsQuotesService ? false : true
    // 全部合约信息
    this.quotesInfo = {}
    this._initQuotesInfo()

    this.dm = new Datamanager()

    let options = {reconnectInterval, reconnectMaxTimes}
    this.quotesWs = new TqWebsocket(wsQuoteUrl, options)
    if(wsTradeUrl === '' || wsTradeUrl === wsQuoteUrl) {
      this.tradeWs = this.quotesWs
    } else {
      this.tradeWs = new TqWebsocket(wsTradeUrl, options)
    }
    this._initWebsocketsCb()
  }

  _initQuotesInfo() {
    if (!this.isQuotesInfoReady) {
      this.isQuotesInfoReady = false
      let tqsdk_this = this
      this.quotesInfoPromise = fetch(this._symbol_services_url, {
        headers: {Accept: 'application/json; charset=utf-8'}
      }).then(response => response.json())
        .then(data => {
          tqsdk_this.quotesInfo = data
          tqsdk_this.isQuotesInfoReady = true
          return Promise.resolve(data)
        })
        .then(()=>{
          tqsdk_this.fire('ready')
        })
        .catch(error => {
          tqsdk_this.fire('error', error)
          return Promise.reject('Error: ' + error.message)
        })
    }
  }

  _separateNotifies (data) {
    let notifies = []
    for (let i=0 ; i<data.length; i++) {
      if (data[i]['notify']){
        let notify = data.splice(i--, 1)[0]['notify']
        for (let k in notify) {
          notifies.push(notify[k])
        }
      }
    }
    return notifies
  }

  on(eventName, fn){
    if (eventName === 'ready') {
      if (this.isQuotesInfoReady) fn.call(this)
      else this.once(eventName, fn)
    } else if (eventName === 'rtn_brokers'){
      if (this.brokers) fn.call(this, this.brokers)
      else this.once(eventName, fn)
    } else if (eventName === 'rtn_data' && this.dm.isChanging('/')) {
      fn.call(this)
      this.addEventListener(eventName, fn)
    } else {
      this.addEventListener(eventName, fn)
    }
  }

  off(eventName, fn){
    this.removeEventListener(eventName, fn)
  }

  _initWebsocketsCb() {
    let tqsdk_this = this

    this.dm.addEventListener('data', function(){
      tqsdk_this.fire('rtn_data', null)
    })

    this.tradeWs.addEventListener('message', function(payload){
      if (payload.aid === 'rtn_brokers') {
        tqsdk_this.brokers = payload.brokers
        tqsdk_this.fire('rtn_brokers', payload.brokers)
      } else if (payload.aid === 'rtn_data') {
        let notifies = tqsdk_this._separateNotifies(payload.data)
        for(let i=0; i<notifies.length; i++) {
          tqsdk_this.fire('notify', notifies[i])
        }
        tqsdk_this.dm.mergeData(payload.data)
      }
      setImmediate(function(){
        tqsdk_this.tradeWs.send('{"aid":"peek_message"}')
      })
    })

    this.tradeWs.addEventListener('reconnect', function(){
      if (tqsdk_this.is_logined()){
        tqsdk_this.login({
          bid: tqsdk_this.login_bid,
          user_id: tqsdk_this.login_user_id,
          password: tqsdk_this.login_password
        })
      }
    })

    this.quotesWs.addEventListener('message', function(payload){
      if (payload.aid === 'rtn_data') {
        tqsdk_this.dm.mergeData(payload.data)
      }
      setImmediate(function(){
        tqsdk_this.quotesWs.send('{"aid":"peek_message"}')
      })
    })

    this.tradeWs.addEventListener('reconnect', function(){
      if (tqsdk_this.dm._data.ins_list) {
        tqsdk_this.subscribe_quote(tqsdk_this.dm._data.ins_list)
      }
    })
  }

  update_data (data) {
    this.dm.mergeData(data, true, false)
  }

  get_by_path (_path) {
    return this.dm._getByPath(_path)
  }

  get_quotes_by_input (_input) {
    if (typeof _input !== 'string' && !_input.input) return []
    let option = {
      input: (typeof _input === 'string') ? _input.toLowerCase() : _input.input.toLowerCase(),
      instrument_id: _input.instrument_id ? _input.instrument_id : true, // 是否根据合约ID匹配
      pinyin: _input.pinyin ? _input.pinyin : true, // 是否根据拼音匹配
      include_expired: _input.include_expired ? _input.include_expired : false, // 匹配结果是否包含已下市合约
      FUTURE: _input.future ? !!_input.future : true, // 匹配结果是否包含期货合约
      FUTURE_INDEX: _input.future_index ? !!_input.future_index: false, // 匹配结果是否包含期货指数
      FUTURE_CONT: _input.future_cont ? !!_input.future_cont: false, // 匹配结果是否包含期货主连
      OPTION: _input.option ? !!_input.option: false, // 匹配结果是否包含期权
      COMBINE: _input.combine ? !!_input.combine: false // 匹配结果是否包含组合
    }

    let filterSymbol = function (filterOption, quote, by) {
      if (filterOption[quote.class] && (filterOption.include_expired || (!filterOption.include_expired && !quote.expired))) {
        if (by === 'instrument_id' && (quote.product_id.toLowerCase() === filterOption.input || quote.instrument_id.toLowerCase().indexOf(filterOption.input)>-1 )) {
          return true
        } else if (by === 'pinyin' && quote.py.split(',').indexOf(filterOption.input) > -1) {
          return true
        } else {
          return false
        }
      }
      return false
    }

    let result = []
    if (option.instrument_id) {
      for(let symbol in this.quotesInfo) {
        if (filterSymbol(option, this.quotesInfo[symbol], 'instrument_id')){
          result.push(symbol)
        }
      }
    }
    if (option.pinyin) {
      for(let symbol in this.quotesInfo) {
        if(filterSymbol(option, this.quotesInfo[symbol], 'pinyin')){
          result.push(symbol)
        }
      }
    }
    return result
  }


  get_quote (symbol) {
    if (symbol === '') return {}
    let symbolObj = this.dm.setDefault('quote', 'quotes', symbol)
    if (!symbolObj['class'] && this.quotesInfo[symbol]) {
      // quotesInfo 中的 last_price
      let last_price = symbolObj.last_price ? symbolObj.last_price : this.quotesInfo[symbol].last_price
      Object.assign(symbolObj, this.quotesInfo[symbol], {last_price})
    }
    return symbolObj
  }

  get_account_id () {
    return this.login_user_id
  }

  get_positions () {
    if (this.is_logined()) {
      return this.dm.setDefault({}, 'trade', this.login_user_id, 'positions');
    } else {
      return null
    }
  }

  get_trades () {
    if (this.is_logined()) {
      return this.dm.setDefault({}, 'trade', this.login_user_id, 'trades');
    } else {
      return null
    }
  }

  get_position (symbol) {
    if (this.is_logined()) {
      return this.dm.setDefault('position', 'trade', this.login_user_id, 'positions', symbol);
    } else {
      return null
    }
  }

  get_orders () {
    if (this.is_logined()) {
      return this.dm.setDefault({}, 'trade', this.login_user_id, 'orders');
    } else {
      return null
    }
  }

  get_order (order_id) {
    if (this.is_logined()) {
      return this.dm.setDefault('order', 'trade', this.login_user_id, 'orders', order_id);
    } else {
      return null
    }
  }

  get_accounts () {
    if (this.is_logined()) {
      return this.dm.setDefault('account', 'trade', this.login_user_id, 'accounts')
    } else {
      return null
    }
  }

  get_account (user_id = this.login_user_id, currency = 'CNY') {
    if (this.is_logined()) {
      return this.dm.setDefault('account', 'trade', this.login_user_id, 'accounts', currency)
    } else {
      return null
    }
  }

  // 通过 trading_day 可以确定登录成功
  get_trading_day () {
    if (this.login_user_id) {
      let d = this.get_by_path(['trade', this.login_user_id, 'session', 'trading_day'])
      return (d && typeof d === "string") ? d : ''
    }
    return ''
  }

  get_klines (symbol, duration) {
    return this.dm.getKlines(symbol, duration)
  }

  get_ticks (symbol) {
    return this.dm.getTicks(symbol)
  }

  is_logined () {
    return !! (this.login_user_id && this.get_trading_day())
  }

  is_changed (target, source) {
    if (target._epoch) return target._epoch === this.dm._epoch
    if (typeof target === 'string') return this.dm.isChanging(target, source)
    return false
  }

  insert_order (payload) {
    if (!this.is_logined()) return null
    let order_id = this._prefix + RandomStr(8)
    let _order_common = {
      user_id: this.login_user_id,
      order_id,
      exchange_id: payload.exchange_id,
      instrument_id: payload.ins_id,
      direction: payload.direction,
      offset: payload.offset,
      price_type: payload.price_type ? payload.price_type : "LIMIT", // "LIMIT" "ANY"
      limit_price: Number(payload.limit_price),
      volume_condition: "ANY", // 数量条件 (ANY=任何数量, MIN=最小数量, ALL=全部数量)
      time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD', // 时间条件 (IOC=立即完成，否则撤销, GFS=本节有效, *GFD=当日有效, GTC=撤销前有效, GFA=集合竞价有效)
    }

    let _order_insert = Object.assign({
      aid: 'insert_order',
      volume: payload.volume
    }, _order_common)
    this.tradeWs.send(_order_insert)

    let _order_init = Object.assign({
      volume_orign: payload.volume, // 总报单手数
      // 委托单当前状态
      status: 'ALIVE', // 委托单状态, (ALIVE=有效, FINISHED=已完)
      volume_left: payload.volume, // 未成交手数
    }, _order_common)
    this.dm.mergeData({
      'trade': {
        [this.login_user_id]: {
          orders: {
            [order_id]: _order_init
          }
        }
      }
    }, false, false)

    return this.get_order(order_id)
  }

  auto_insert_order (payload) {
    if (!this.is_logined()) return null

    /* payload : {symbol, exchange_id, ins_id, direction, price_type, limit_price, offset, volume} */

    let initOrder = {
      price_type: payload.price_type ? payload.price_type : "LIMIT", // "LIMIT" "ANY"
      volume_condition: "ANY",
      time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD',
      exchange_id: payload.exchange_id,
      instrument_id: payload.ins_id,
      direction: payload.direction,
      limit_price: Number(payload.limit_price)
    }
    if (payload.exchange_id === 'SHFE' && payload.offset === 'CLOSE') {
      let position = this.dm.getPosition(payload.symbol, this.login_user_id)
      // 拆单，先平今再平昨
      let closeTodayVolume = 0
      if (payload.direction === 'BUY' && position.volume_short_today > 0) {
        closeTodayVolume = Math.min(position.volume_short_today, payload.volume)
      } else if (payload.direction === 'SELL' && position.volume_long_today > 0) {
        closeTodayVolume = Math.min(position.volume_long_today, payload.volume)
      }
      if (closeTodayVolume > 0) {
        this.insert_order(Object.assign({
          offset: 'CLOSETODAY',
          volume: closeTodayVolume
        }, initOrder))
      }
      if (payload.volume - closeTodayVolume > 0) {
        this.insert_order(Object.assign({
          offset: 'CLOSE',
          volume: payload.volume - closeTodayVolume
        }, initOrder))
      }
    } else {
      this.insert_order(Object.assign({
        offset: payload.offset,
        volume: payload.volume
      }, initOrder))
    }
  }

  cancel_order (payload) {
    this.tradeWs.send({
      aid: 'cancel_order',
      user_id: this.login_user_id,
      order_id: payload.order_id ? payload.order_id : payload
    })
  }

  // 登录
  login (payload) {
    this.login_bid = payload.bid,
    this.login_user_id = payload.user_id
    this.login_password = payload.password
    this.tradeWs.send({
      aid: 'req_login',
      bid: payload.bid,
      user_name: payload.user_id,
      password: payload.password
    })
  }

  // 确认结算单
  confirm_settlement () {
    this.tradeWs.send({
      aid: 'confirm_settlement'
    })
  }

  // 银期转账
  transfer (payload) {
    this.tradeWs.send({
      aid: 'req_transfer',
      bank_id: payload.bank_id, // 银行ID
      bank_password: payload.bank_password, // 银行账户密码
      future_account: payload.future_account, // 期货账户
      future_password: payload.future_password, // 期货账户密码
      currency: 'CNY', // 币种代码
      amount: payload.amount // 转账金额, >0 表示转入期货账户, <0 表示转出期货账户
    })
  }

  subscribe_quote (quotes) {
    this.quotesWs.send({
      aid: "subscribe_quote",
      ins_list: Array.isArray(quotes) ? quotes.join(',') : quotes
    })
  }

  set_chart(payload) {
    let content = {}
    if (payload.trading_day_start || payload.trading_day_count) {
      // 指定交易日，返回对应的数据
      content.trading_day_start = payload.trading_day_start ? payload.trading_day_start : 0
      // trading_day_count 请求交易日天数
      content.trading_day_count = payload.trading_day_count ? payload.trading_day_count : 3600 * 24 * 1e9
    } else {
      content.view_width = payload.view_width ? payload.view_width : 500
      if (payload.left_kline_id) {
        // 指定一个K线id，向右请求N个数据
        content.left_kline_id = payload.left_kline_id
      } else if (payload.focus_datetime) {
        // 使得指定日期的K线位于屏幕第M个柱子的位置
        content.focus_datetime = payload.focus_datetime // 日线及以上周期是交易日，其他周期是时间，UnixNano 北京时间
        content.focus_position = payload.focus_position ? payload.focus_position : 0
      }
    }
    this.quotesWs.send(Object.assign({
      aid: 'set_chart',
      chart_id: payload.chart_id ? payload.chart_id : (this._prefix + 'kline_chart'),
      ins_list: payload.ins_list ? payload.ins_list.join(',') : payload.symbol,
      duration: payload.duration
    }, content))
  }

}

export default TQSDK
