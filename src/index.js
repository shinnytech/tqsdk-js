/* eslint-disable camelcase */
import axios from 'axios'
import { TqQuoteWebsocket, TqTradeWebsocket, TqRecvOnlyWebsocket } from './tqwebsocket'
import DataManager from './datamanage'
import EventEmitter from 'eventemitter3'
import { RandomStr, ParseSettlementContent } from './utils'
import { QUOTE } from './datastructure'

/**
 * 事件类型
 + ready: 收到合约基础数据（全局只出发一次）
 + rtn_brokers: 收到期货公司列表（全局只出发一次）
 + notify: 收到通知对象
 + rtn_data: 数据更新（每一次数据更新触发）
 + error: 发生错误(目前只有一种：合约服务下载失败)
 */

// 支持多账户登录

class TQSDK extends EventEmitter {
  constructor ({
    symbolsServerUrl = 'https://openmd.shinnytech.com/t/md/symbols/latest.json',
    wsQuoteUrl = 'wss://openmd.shinnytech.com/t/md/front/mobile',
    wsTradeUrl = 'wss://opentd.shinnytech.com/trade/user0',
    clientSystemInfo = '',
    clientAppId = '',
    autoInit = true,
    data = {
      klines: {},
      quotes: {},
      charts: {},
      ticks: {},
      trade: {}
    }
  } = {}) {
    super()
    this._insUrl = symbolsServerUrl
    this._mdUrl = wsQuoteUrl
    this._tdUrl = wsTradeUrl
    this.clientSystemInfo = clientSystemInfo
    this.clientAppIds = clientAppId

    this._prefix = 'TQJS_'

    const self = this
    this.dm = new DataManager(data)
    this.dm.on('data', function () {
      self.emit('rtn_data', null)
    })

    this.brokers = null
    this.trade_accounts = {} // 添加账户
    this.isReady = false
    this.quotesWs = null
    this.quotesInfo = {}
    if (autoInit) {
      this.init() // 自动执行初始化
    }
  }

  init () {
    this.initMdWebsocket()
    this.initTdWebsocket()
  }

  initMdWebsocket () {
    const self = this
    axios.get(this._insUrl, {
      headers: { Accept: 'application/json; charset=utf-8' }
    }).then(response => {
      self.quotesInfo = response.data
      // 建立行情连接
      self.isReady = true
      self.emit('ready')
      self.emit('rtn_data', null)
    }).catch(error => {
      self.emit('error', error)
      console.error('Error: ' + error.message)
      return error
    })
    this.quotesWs = new TqQuoteWebsocket(this._mdUrl, this.dm)
  }

  initTdWebsocket () {
    const self = this
    // 支持分散部署的交易中继网关
    axios.get('https://files.shinnytech.com/broker-list.json', {
      headers: { Accept: 'application/json; charset=utf-8' }
    }).then(response => {
      self.brokers_list = response.data
      self.brokers = Object.keys(response.data).filter(x => !x.endsWith(' '))
      self.emit('rtn_brokers', self.brokers)
      console.log(self.brokers)
    }).catch(error => {
      self.emit('error', error)
      console.error('Error: ' + error.message)
      return error
    })
  }

  addWebSocket (url = '') {
    if (url) return new TqRecvOnlyWebsocket(url, this.dm)
    return null
  }

  // user_id 作为唯一 key
  addAccount (bid, userId, password) {
    if (bid && userId && password) {
      if (this.brokers.indexOf(bid) === -1) {
        console.error('不支持该期货公司')
        return
      }
      if (!this.trade_accounts[userId]) {
        const ws = new TqTradeWebsocket(this.brokers_list[bid].url, this.dm)
        const self = this
        ws.on('notify', function (n) {
          self.emit('notify', Object.assign(n, {
            bid: bid,
            user_id: userId
          }))
        })
        this.trade_accounts[userId] = {
          bid,
          userId,
          password,
          ws
        }
      }
      return this.trade_accounts[userId]
    } else {
      return null
    }
  }

  removeAccount (bid, userId) {
    if (bid && userId) {
      if (this.trade_accounts[userId]) {
        // close 相应的 websocket
        this.trade_accounts[userId].ws.close()
        delete this.trade_accounts[userId]
        // 删除用户相应的数据
        delete this.dm._data.trade[userId]
      }
    }
  }

  refreshAccount (bid, userId) {
    if (bid && userId) {
      if (this.trade_accounts[userId]) {
        this.trade_accounts[userId].ws.send({ aid: 'qry_account_info' })
        this.trade_accounts[userId].ws.send({ aid: 'qry_account_register' })
      }
    }
  }

  refreshAccounts () {
    for (const userId in this.trade_accounts) {
      this.trade_accounts[userId].ws.send({ aid: 'qry_account_info' })
      this.trade_accounts[userId].ws.send({ aid: 'qry_account_register' })
    }
  }

  updateData (data) {
    this.dm.mergeData(data, true, false)
  }

  getByPath (_path) {
    return this.dm.getByPath(_path)
  }

  /** ***************** 行情接口 get_quotes_by_input ********************/
  getQuotesByInput (_input) {
    if (typeof _input !== 'string' && !_input.input) return []
    const option = {
      input: (typeof _input === 'string') ? _input.toLowerCase() : _input.input.toLowerCase(),
      instrument_id: _input.instrument_id ? _input.instrument_id : true, // 是否根据合约ID匹配
      pinyin: _input.pinyin ? _input.pinyin : true, // 是否根据拼音匹配
      include_expired: _input.include_expired ? _input.include_expired : false, // 匹配结果是否包含已下市合约
      FUTURE: _input.future ? !!_input.future : true, // 匹配结果是否包含期货合约
      FUTURE_INDEX: _input.future_index ? !!_input.future_index : false, // 匹配结果是否包含期货指数
      FUTURE_CONT: _input.future_cont ? !!_input.future_cont : false, // 匹配结果是否包含期货主连
      OPTION: _input.option ? !!_input.option : false, // 匹配结果是否包含期权
      COMBINE: _input.combine ? !!_input.combine : false // 匹配结果是否包含组合
    }

    const filterSymbol = function (filterOption, quote, by) {
      if (filterOption[quote.class] && (filterOption.include_expired || (!filterOption.include_expired && !quote.expired))) {
        if (by === 'instrument_id') {
          if (quote.product_id.toLowerCase() === filterOption.input) {
            return true
          } else if (filterOption.input.length > 2 && quote.instrument_id.toLowerCase().indexOf(filterOption.input) > -1) {
            return true
          } else {
            return false
          }
        } else if (by === 'pinyin' && quote.py.split(',').indexOf(filterOption.input) > -1) {
          return true
        } else {
          return false
        }
      }
      return false
    }

    const result = []
    if (option.instrument_id) {
      for (const symbol in this.quotesInfo) {
        if (filterSymbol(option, this.quotesInfo[symbol], 'instrument_id')) {
          result.push(symbol)
        }
      }
    }
    if (option.pinyin) {
      for (const symbol in this.quotesInfo) {
        if (filterSymbol(option, this.quotesInfo[symbol], 'pinyin')) {
          result.push(symbol)
        }
      }
    }
    return result
  }

  /** ***************** 行情接口 get_quote ********************/
  getQuote (symbol) {
    if (symbol === '') return {}
    const symbolObj = this.dm.setDefault(['quotes', symbol], new QUOTE())
    if (!symbolObj.class && this.quotesInfo[symbol]) {
      // quotesInfo 中的 last_price
      // eslint-disable-next-line camelcase
      const last_price = symbolObj.last_price ? symbolObj.last_price : this.quotesInfo[symbol].last_price
      Object.assign(symbolObj, this.quotesInfo[symbol], { last_price })
    }
    return symbolObj
  }

  /** ***************** 行情接口 set_chart ********************/
  setChart (payload) {
    const content = {}
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

  /** ***************** 交易接口 get_user ********************/
  getUser (payload) {
    const userId = typeof payload === 'string' ? payload : payload.user_id
    return userId ? this.dm._data.trade[userId] : null
  }

  /** ***************** 接口 get ********************/
  get ({
    // 交易 ['users', 'user', 'session', 'accounts', 'account', 'positions', 'position', 'orders', 'order', 'trades', 'trade']
    // 结算单 ['his_settlements', 'his_settlement'] @20190618新增
    // 行情 ['quotes', 'quote', 'ticks', 'klines', 'charts', 'chart']
    name = 'users',
    user_id = '', // 以下 name 有效 ['user', 'session', 'accounts', 'account', 'positions', 'position', 'orders', 'order', 'trades', 'trade']
    currency = 'CNY', // 以下 name 有效 ['account']
    symbol = '', // 以下 name 有效 ['position'] ['quote', 'ticks', 'klines']
    order_id = '', // 以下 name 有效 ['order']
    trade_id = '', // 以下 name 有效 ['trade']
    trading_day = '', // 以下 name 有效 ['his_settlement']
    chart_id = '', // 以下 name 有效 ['chart']
    input = '', // 以下 name 有效 ['quotes']
    duration = 0 // 以下 name 有效 ['klines']
  } = {}) {
    if (name === 'users') {
      return Object.keys(this.trade_accounts)
    }
    if (user_id) {
      // get 交易相关数据
      const user = this.get_user(user_id)
      if (name === 'user') {
        return user
      }
      if (['session', 'accounts', 'positions', 'orders', 'trades', 'his_settlements'].indexOf(name) > -1) {
        return user && user[name] ? user[name] : null
      } else if (user && user[name + 's']) {
        const k = name === 'account' ? currency : name === 'position' ? symbol : name === 'order' ? order_id : name === 'trade' ? trade_id : name === 'his_settlement' ? trading_day : ''
        return user[name + 's'][k]
      }
      return null
    } else {
      // get 行情相关数据
      if (name === 'quotes') {
        return input ? this.get_quotes_by_input(input) : []
      }
      if (name === 'quote') return this.getQuote(symbol)
      if (name === 'klines') return this.getKlines(symbol, duration)
      if (name === 'ticks') return this.getTicks(symbol)
      if (name === 'charts') return this.dm.getByPath(['charts'])
      if (name === 'chart') return this.dm.getByPath(['charts', chart_id])
    }
  }

  getKlines (symbol, dur) {
    if (symbol === '') return null
    let ks = this.dm.getByPath(['klines', symbol, dur])
    if (!ks || !ks.data || ks.last_id === -1) {
      this.dm.mergeData({
        klines: {
          [symbol]: {
            [dur]: {
              last_id: -1, data: {}
            }
          }
        }
      }, false, false)
      ks = this.dm.getByPath(['klines', symbol, dur])
    }
    return ks
  }

  getTicks (symbol) {
    if (symbol === '') return null
    const ts = this.dm.getByPath(['ticks', symbol])
    if (!ts || !ts.data) {
      this.dm.mergeData({
        ticks: {
          [symbol]: {
            last_id: -1, data: {}
          }
        }
      }, false, false)
    }
    return this.dm.getByPath(['ticks', symbol])
  }

  isLogined (payload) {
    const session = this.get({
      name: 'session',
      user_id: payload.user_id
    })
    return !!(session && session.trading_day)
  }

  isChanging (target, source) {
    if (target && target._epoch) return target._epoch === this.dm._epoch
    if (typeof target === 'string') return this.dm.isChanging(target, source)
    return false
  }

  insertOrder (payload) {
    if (!this.is_logined(payload)) return null
    const orderId = this._prefix + RandomStr(8)
    const _order_common = {
      user_id: payload.user_id,
      orderId,
      exchange_id: payload.exchange_id,
      instrument_id: payload.ins_id,
      direction: payload.direction,
      offset: payload.offset,
      price_type: payload.price_type ? payload.price_type : 'LIMIT', // "LIMIT" "ANY"
      limit_price: Number(payload.limit_price),
      volume_condition: 'ANY', // 数量条件 (ANY=任何数量, MIN=最小数量, ALL=全部数量)
      time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD' // 时间条件 (IOC=立即完成，否则撤销, GFS=本节有效, *GFD=当日有效, GTC=撤销前有效, GFA=集合竞价有效)
    }

    const _orderInsert = Object.assign({
      aid: 'insert_order',
      volume: payload.volume
    }, _order_common)
    this.trade_accounts[payload.user_id].ws.send(_orderInsert)

    const _orderInit = Object.assign({
      volume_orign: payload.volume, // 总报单手数
      // 委托单当前状态
      status: 'ALIVE', // 委托单状态, (ALIVE=有效, FINISHED=已完)
      volume_left: payload.volume // 未成交手数
    }, _order_common)
    this.dm.mergeData({
      trade: {
        [payload.user_id]: {
          orders: {
            [orderId]: _orderInit
          }
        }
      }
    }, false, false)

    return this.get({
      name: 'order',
      user_id: payload.user_id,
      orderId
    })
  }

  autoInsertOrder (payload) {
    if (!this.is_logined(payload)) return null

    /* payload : {symbol, exchange_id, ins_id, direction, price_type, limit_price, offset, volume} */

    const initOrder = {
      user_id: payload.user_id,
      price_type: payload.price_type ? payload.price_type : 'LIMIT', // "LIMIT" "ANY"
      volume_condition: 'ANY',
      time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD',
      exchange_id: payload.exchange_id,
      instrument_id: payload.ins_id,
      direction: payload.direction,
      limit_price: Number(payload.limit_price)
    }
    if (payload.exchange_id === 'SHFE' && payload.offset === 'CLOSE') {
      const position = this.dm.getPosition(payload.symbol, payload.user_id)
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

  cancelOrder (payload) {
    this.trade_accounts[payload.user_id].ws.send({
      aid: 'cancel_order',
      user_id: payload.user_id,
      order_id: payload.order_id ? payload.order_id : payload
    })
  }

  // 登录
  login (payload) {
    this.trade_accounts[payload.user_id].ws.send({
      aid: 'req_login',
      bid: payload.bid,
      user_name: payload.user_id,
      password: payload.password,
      client_system_info: this.clientSystemInfo,
      client_app_id: this.clientAppId
    })
  }

  // 确认结算单
  confirmSettlement (payload) {
    this.trade_accounts[payload.user_id].ws.send({
      aid: 'confirm_settlement'
    })
  }

  // 银期转账
  transfer (payload) {
    this.trade_accounts[payload.user_id].ws.send({
      aid: 'req_transfer',
      bank_id: payload.bank_id, // 银行ID
      bank_password: payload.bank_password, // 银行账户密码
      future_account: payload.future_account, // 期货账户
      future_password: payload.future_password, // 期货账户密码
      currency: 'CNY', // 币种代码
      amount: payload.amount // 转账金额, >0 表示转入期货账户, <0 表示转出期货账户
    })
  }

  // 历史结算单
  hisSettlement (payload) {
    if (!TQSDK.store) return null
    // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
    // 缓存策略 1 dm有历史结算单
    let content = this.dm.getByPath(['trade', payload.user_id, 'his_settlements', payload.trading_day])
    if (content !== undefined) return
    // 缓存策略 2 缓存中读取历史结算单
    const self = this
    content = TQSDK.store.getContent(payload.user_id, payload.trading_day).then(function (value) {
      if (value === null) {
        // 缓存策略 2.1 未读取到发送请求
        self.trade_accounts[payload.user_id].ws.send({
          aid: 'qry_settlement_info',
          trading_day: Number(payload.trading_day)
        })
      } else {
        const content = ParseSettlementContent(value)
        // 缓存策略 2.2 读取到存到dm
        self.dm.mergeData({
          trade: {
            [payload.user_id]: {
              his_settlements: {
                [payload.trading_day]: content
              }
            }
          }
        }, true, false)
      }
    }).catch(function (err) {
      // 当出错时，此处代码运行
      console.error(err)
    })
  }

  subscribeQuote (quotes) {
    this.quotesWs.send({
      aid: 'subscribe_quote',
      ins_list: Array.isArray(quotes) ? quotes.join(',') : quotes
    })
  }
}
// 保留原先小寫加下划綫接口,新增接口都是駝峰標誌
TQSDK.prototype.subscribe_quote = TQSDK.prototype.subscribeQuote
TQSDK.prototype.his_settlement = TQSDK.prototype.hisSettlement
TQSDK.prototype.confirm_settlement = TQSDK.prototype.confirmSettlement
TQSDK.prototype.add_account = TQSDK.prototype.addAccount
TQSDK.prototype.remove_account = TQSDK.prototype.removeAccount
TQSDK.prototype.update_data = TQSDK.prototype.updateData
TQSDK.prototype.get_by_path = TQSDK.prototype.getByPath
TQSDK.prototype.get_quotes_by_input = TQSDK.prototype.getQuotesByInput
TQSDK.prototype.get_quote = TQSDK.prototype.getQuote
TQSDK.prototype.set_chart = TQSDK.prototype.setChart
TQSDK.prototype.get_user = TQSDK.prototype.getUser
TQSDK.prototype.is_logined = TQSDK.prototype.isLogined
TQSDK.prototype.is_changed = TQSDK.prototype.isChanging
TQSDK.prototype.insert_order = TQSDK.prototype.insertOrder
TQSDK.prototype.auto_insert_order = TQSDK.prototype.autoInsertOrder
TQSDK.prototype.cancel_order = TQSDK.prototype.cancelOrder

export default TQSDK
