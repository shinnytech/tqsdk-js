/* eslint-disable no-eval */

import EventEmitter from 'eventemitter3';
import store from './cache';
import {ParseSettlementContent} from './utils'

/**
 * let ws = new TqWebsocket(url, options)
 * PARAMS:
 *   url [string | array]
 *   options [object]
 *       { reconnectInterval, -- 重连时间间隔
  *        reconnectMaxTimes  -- 重连最大次数
 *       }
 *
 * METHODS:
 *   ws.init()
 *   ws.on(eventName, (data) => {......})
 *      eventName =
 *      ['message', -- 收到信息
 *       'open', -- 连接建立
 *       'reconnect', -- 重新开始建立连接
 *       'close', -- 某个连接关闭
 *       'error', -- 某个连接报错
 *       'death' -- 不再重连
 *      ]
 *   ws.send( [obj | string] )
 *   ws.close()
 */

class TqWebsocket extends EventEmitter {
  constructor(url, options = {}) {
    super()
    this.urlList = (url instanceof Array) ? url : [url]

    this.ws = null
    this.queue = []

    // 自动重连开关
    this.reconnect = true
    this.reconnectTask = null
    this.reconnectInterval = options.reconnectInterval ? options.reconnectInterval : 3000
    this.reconnectMaxTimes = options.reconnectMaxTimes ? options.reconnectMaxTimes : 5
    this.reconnectTimes = 0
    this.reconnectUrlIndex = 0

    this.STATUS = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    }

    this.__init()
  }

  // string or object
  send(obj) {
    let objToJson = JSON.stringify(obj)
    if (this.isReady()) {
      this.ws.send(objToJson)
    } else {
      this.queue.push(objToJson)
    }
  }

  isReady() {
    return this.ws.readyState === WebSocket.OPEN
  }

  __init() {
    this.ws = new WebSocket(this.urlList[this.reconnectUrlIndex])

    if (this.reconnectUrlIndex === this.urlList.length - 1) {
      // urlList 循环尝试重连一轮, times += 1
      this.reconnectTimes += 1
    }

    let _this = this

    this.ws.onmessage = function (message) {
      let data = eval('(' + message.data + ')')
      _this.emit('message', data)
      setImmediate(function () {
        _this.ws.send('{"aid":"peek_message"}')
      })
    }

    this.ws.onclose = function (event) {
      console.log('close', event)
      _this.emit('close')
      // 清空 queue
      _this.queue = []
      // 自动重连
      if (_this.reconnect) {
        if (_this.reconnectMaxTimes <= _this.reconnectTimes) {
          clearTimeout(_this.reconnectTask);
          _this.emit('death', {
            msg: '超过重连次数' + _this.reconnectMaxTimes
          })
        } else {
          _this.reconnectTask = setTimeout(function () {
            if (_this.ws.readyState === 3) {
              // 每次重连的时候设置 _this.reconnectUrlIndex
              _this.reconnectUrlIndex = (_this.reconnectUrlIndex + 1) < _this.urlList.length ? _this.reconnectUrlIndex + 1 : 0
              _this.__init()
              _this.emit('reconnect', {
                msg: '发起重连第 ' + _this.reconnectTimes + ' 次'
              })
            }
          }, _this.reconnectInterval)
        }
      }
    }

    this.ws.onerror = error => {
      _this.emit('error', error)
      _this.ws.close()
    }

    this.ws.onopen = function () {
      _this.emit('open', {
        msg: '发起重连第 ' + _this.reconnectTimes + ' 次, 成功'
      })
      _this.reconnectTimes = 0
      _this.reconnectUrlIndex = 0
      if (this.reconnectTask) {
        clearTimeout(_this.reconnectTask)
      }
      while (_this.queue.length > 0) {
        if (_this.ws.readyState === 1) _this.ws.send(_this.queue.shift())
        else break
      }
    }
  }

  close() {
    this.ws.onclose = function () {
    };
    this.ws.close()
  }
}


class TqTradeWebsocket extends TqWebsocket {
  constructor(url, dm, options = {}) {
    super(url, options)
    this.dm = dm
    // 记录重连时需要重发的数据
    this.req_login = null
    this.init()
  }

  init() {
    let ws_this = this;

    this.on('message', function (payload) {
      if (payload.aid === 'rtn_data') {
        let notifies = ws_this._separateNotifies(payload.data)
        for (let i = 0; i < notifies.length; i++) {
          ws_this.emit('notify', notifies[i])
        }
        ws_this.dm.mergeData(payload.data)
      } else if (payload.aid === 'rtn_brokers') {
        ws_this.emit('rtn_brokers', payload.brokers)
      } else if (payload.aid === 'qry_settlement_info') {
        // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
        let content = ParseSettlementContent(payload.settlement_info)
        // 1 写入 dm
        ws_this.dm.mergeData({
          'trade': {
            [payload.user_name] : {
              'his_settlements': {
                [payload.trading_day]: content
              }
            }
          }
        })
        // 2 存入缓存
        store.setContent(payload.user_name, payload.trading_day, payload.settlement_info)
      }
    })

    this.on('reconnect', function () {
      if (ws_this.req_login) ws_this.send(ws_this.req_login)
    })
  }

  _separateNotifies(data) {
    let notifies = []
    for (let i = 0; i < data.length; i++) {
      if (data[i]['notify']) {
        let notify = data.splice(i--, 1)[0]['notify']
        for (let k in notify) {
          notifies.push(notify[k])
        }
      }
    }
    return notifies
  }

  send(obj) {
    if (obj.aid === 'req_login') {
      this.req_login = obj
    }
    super.send(obj)
  }
}

class TqQuoteWebsocket extends TqWebsocket {
  constructor(url, dm, options = {}) {
    super(url, options)
    this.dm = dm
    // 记录重连时需要重发的数据
    this.subscribe_quote = null
    this.charts = {}
    this.init()
  }

  init() {
    let ws_this = this;

    this.on('message', function (payload) {
      if (payload.aid === 'rtn_data') {
        ws_this.dm.mergeData(payload.data)
      }
    })

    this.on('reconnect', function (e) {
      console.log(e)
      if (ws_this.subscribe_quote) {
        ws_this.send(ws_this.subscribe_quote)
      }
      for (let chart_id in ws_this.charts) {
        if (ws_this.charts[chart_id].view_width > 0) {
          ws_this.send(ws_this.charts[chart_id])
        }
      }
    })
  }

  send(obj) {
    if (obj.aid === 'subscribe_quote') {
      if (this.subscribe_quote === null || JSON.stringify(obj.ins_list) !== JSON.stringify(this.subscribe_quote.ins_list)){
        this.subscribe_quote = obj
        super.send(obj)
      }
    } else if (obj.aid === 'set_chart') {
      if (obj.view_width === 0) {
        if (this.charts[obj.chart_id]) delete this.charts[obj.chart_id]
      } else {
        this.charts[obj.chart_id] = obj
      }
      super.send(obj)
    }
  }
}

export {
  TqTradeWebsocket,
  TqQuoteWebsocket
}
