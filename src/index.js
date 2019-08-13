import axios from 'axios'
import { TqQuoteWebsocket, TqTradeWebsocket } from './tqwebsocket'
import Datamanager from './datamanage'
import EventEmitter from 'eventemitter3'
import { RandomStr, ParseSettlementContent } from './utils'
import store from './cache'

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
                 wsTradeUrl = 'wss://t.shinnytech.com/trade/shinny',
                 client_system_info = '',
                 client_app_id = ''
               } = {}) {
    super()
    this.version = __VERSION__

    this._symbol_services_url = symbolsServerUrl
    this._ws_quote_url = wsQuoteUrl
    this._ws_trade_url = wsTradeUrl
    this.client_system_info = client_system_info
    this.client_app_id = client_app_id

    this._prefix = 'TQJS_'

    let tqsdk_this = this
    this.dm = new Datamanager()
    this.dm.on('data', function () {
      tqsdk_this.emit('rtn_data', null)
    })

    this.brokers = null
    this.trade_accounts = {} // 添加账户

    this.isReady = false
    this.quotesWs = new TqQuoteWebsocket(wsQuoteUrl, this.dm)
    this.quotesInfo = {}

    this.defaultTradeWs = new TqTradeWebsocket(wsTradeUrl, this.dm)
    this.defaultTradeWs.on('rtn_brokers', function (brokers) {
      tqsdk_this.brokers = brokers
      tqsdk_this.emit('rtn_brokers', brokers)
    })

    axios.get(this._symbol_services_url, {
      headers: { Accept: 'application/json; charset=utf-8' }
    }).then(response => {
      tqsdk_this.quotesInfo = response.data
      // 建立行情连接
      tqsdk_this.isReady = true
      tqsdk_this.emit('ready')
      tqsdk_this.emit('rtn_data', null)
    }).catch(error => {
      tqsdk_this.emit('error', error)
      console.error('Error: ' + error.message)
      return error
    })
  }

  // user_id 作为唯一 key
  add_account (bid, user_id, password) {
    if (bid && user_id && password) {
      if (!this.trade_accounts[user_id]) {
        let ws = this.defaultTradeWs.req_login === null ?
          this.defaultTradeWs : new TqTradeWebsocket(this._ws_trade_url, this.dm)
        let tqsdk_this = this
        ws.on('notify', function (n) {
          tqsdk_this.emit('notify', Object.assign(n, {
            bid: bid,
            user_id: user_id
          }))
        })
        this.trade_accounts[user_id] = {
          bid,
          user_id,
          password,
          ws
        }
      }
      return this.trade_accounts[user_id]
    } else {
      return null
    }
  }

  remove_account (bid, user_id, password) {
    if (bid && user_id) {
      if (this.trade_accounts[user_id]) {
        // close 相应的 websocket
        this.trade_accounts[user_id].ws.close()
        delete this.trade_accounts[user_id]
        // 删除用户相应的数据
        delete this.dm._data.trade[user_id]
      }
    }
  }

  update_data (data) {
    this.dm.mergeData(data, true, false)
  }

  get_by_path (_path) {
    return this.dm._getByPath(_path)
  }

  /******************* 行情接口 get_quotes_by_input ********************/
  get_quotes_by_input (_input) {
    if (typeof _input !== 'string' && !_input.input) return []
    let option = {
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

    let filterSymbol = function (filterOption, quote, by) {
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

    let result = []
    if (option.instrument_id) {
      for (let symbol in this.quotesInfo) {
        if (filterSymbol(option, this.quotesInfo[symbol], 'instrument_id')) {
          result.push(symbol)
        }
      }
    }
    if (option.pinyin) {
      for (let symbol in this.quotesInfo) {
        if (filterSymbol(option, this.quotesInfo[symbol], 'pinyin')) {
          result.push(symbol)
        }
      }
    }
    return result
  }

  /******************* 行情接口 get_quote ********************/
  get_quote (symbol) {
    if (symbol === '') return {}
    let symbolObj = this.dm.setDefault('quote', 'quotes', symbol)
    if (!symbolObj['class'] && this.quotesInfo[symbol]) {
      // quotesInfo 中的 last_price
      let last_price = symbolObj.last_price ? symbolObj.last_price : this.quotesInfo[symbol].last_price
      Object.assign(symbolObj, this.quotesInfo[symbol], { last_price })
    }
    return symbolObj
  }

  /******************* 行情接口 set_chart ********************/
  set_chart (payload) {
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

  /******************* 交易接口 get_user ********************/
  get_user (payload) {
    let user_id = typeof payload === 'string' ? payload : payload.user_id
    return user_id ? this.dm._data.trade[user_id] : null
  }

  /******************* 接口 get ********************/
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
         duration = 0  // 以下 name 有效 ['klines']
       } = {}) {
    if (name === 'users') {
      return Object.keys(this.trade_accounts)
    }
    if (user_id) {
      // get 交易相关数据
      let user = this.get_user(user_id)
      if (name === 'user') {
        return user
      }
      if (['session', 'accounts', 'positions', 'orders', 'trades', 'his_settlements'].indexOf(name) > -1) {
        return user && user[name] ? user[name] : null
      } else if (user && user[name + 's']) {
        let k = name === 'account' ? currency : name === 'position' ? symbol : name === 'order' ? order_id : name === 'trade' ? trade_id : name === 'his_settlement' ? trading_day : ''
        return user[name + 's'][k]
      }
      return null
    } else {
      // get 行情相关数据
      if (name === 'quotes') {
        return input ? this.get_quotes_by_input(input) : []
      }
      if (name === 'quote') return this.get_quote(symbol)
      if (name === 'klines') return this.dm.getKlines(symbol, duration)
      if (name === 'ticks') return this.dm.getTicks(symbol)
      if (name === 'charts') return this.dm._getByPath(['charts'])
      if (name === 'chart') return this.dm._getByPath(['charts', chart_id])
    }
  }

  is_logined (payload) {
    let session = this.get({
      name: 'session',
      user_id: payload.user_id
    })
    return !!(session && session.trading_day)
  }

  is_changed (target, source) {
    if (target && target._epoch) return target._epoch === this.dm._epoch
    if (typeof target === 'string') return this.dm.isChanging(target, source)
    return false
  }

  insert_order (payload) {
    if (!this.is_logined(payload)) return null
    let order_id = this._prefix + RandomStr(8)
    let _order_common = {
      user_id: payload.user_id,
      order_id,
      exchange_id: payload.exchange_id,
      instrument_id: payload.ins_id,
      direction: payload.direction,
      offset: payload.offset,
      price_type: payload.price_type ? payload.price_type : "LIMIT", // "LIMIT" "ANY"
      limit_price: Number(payload.limit_price),
      volume_condition: "ANY", // 数量条件 (ANY=任何数量, MIN=最小数量, ALL=全部数量)
      time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD' // 时间条件 (IOC=立即完成，否则撤销, GFS=本节有效, *GFD=当日有效, GTC=撤销前有效, GFA=集合竞价有效)
    }

    let _order_insert = Object.assign({
      aid: 'insert_order',
      volume: payload.volume
    }, _order_common)
    this.trade_accounts[payload.user_id].ws.send(_order_insert)

    let _order_init = Object.assign({
      volume_orign: payload.volume, // 总报单手数
      // 委托单当前状态
      status: 'ALIVE', // 委托单状态, (ALIVE=有效, FINISHED=已完)
      volume_left: payload.volume // 未成交手数
    }, _order_common)
    this.dm.mergeData({
      'trade': {
        [payload.user_id]: {
          orders: {
            [order_id]: _order_init
          }
        }
      }
    }, false, false)

    return this.get({
      name: 'order',
      user_id: payload.user_id,
      order_id
    })
  }

  auto_insert_order (payload) {
    if (!this.is_logined(payload)) return null

    /* payload : {symbol, exchange_id, ins_id, direction, price_type, limit_price, offset, volume} */

    let initOrder = {
      user_id: payload.user_id,
      price_type: payload.price_type ? payload.price_type : "LIMIT", // "LIMIT" "ANY"
      volume_condition: "ANY",
      time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD',
      exchange_id: payload.exchange_id,
      instrument_id: payload.ins_id,
      direction: payload.direction,
      limit_price: Number(payload.limit_price)
    }
    if (payload.exchange_id === 'SHFE' && payload.offset === 'CLOSE') {
      let position = this.dm.getPosition(payload.symbol, payload.user_id)
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
      client_system_info: this.client_system_info,
      client_app_id: this.client_app_id
    })
  }

  // 确认结算单
  confirm_settlement (payload) {
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
  his_settlement (payload) {
    // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
    // 缓存策略 1 dm有历史结算单
    let content = this.dm._getByPath(['trade', payload.user_id, 'his_settlements', payload.trading_day])
    if (content !== undefined) return
    // 缓存策略 2 缓存中读取历史结算单
    let _this = this
    content = store.getContent(payload.user_id, payload.trading_day).then(function (value) {
      if (value === null) {
        // 缓存策略 2.1 未读取到发送请求
        _this.trade_accounts[payload.user_id].ws.send({
          aid: 'qry_settlement_info',
          trading_day: Number(payload.trading_day)
        })
      } else {
        let content = ParseSettlementContent(value)
        // 缓存策略 2.2 读取到存到dm
        _this.dm.mergeData({
          'trade': {
            [payload.user_id]: {
              'his_settlements': {
                [payload.trading_day]: content
              }
            }
          }
        }, true, false)
      }
    }).catch(function (err) {
      // 当出错时，此处代码运行
      console.log(err)
    })
  }

  subscribe_quote (quotes) {
    this.quotesWs.send({
      aid: "subscribe_quote",
      ins_list: Array.isArray(quotes) ? quotes.join(',') : quotes
    })
  }
}

export default TQSDK
