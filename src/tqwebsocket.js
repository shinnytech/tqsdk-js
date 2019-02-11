/* eslint-disable no-eval */

import EventPrototype from './event'

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
 *   ws.addEventListener('message', (data) => {......})
 *      eventTypes =
 *      ['message', -- 收到信息
 *       'open', -- 连接建立
 *       'reconnect', -- 重新开始建立连接
 *       'close', -- 某个连接关闭
 *       'error', -- 某个连接报错
 *       'death' -- 不再重连
 *      ]
 *   ws.send( [obj | string] )
 */

export default class TqWebsocket extends EventPrototype {
  constructor (url, options = {}) {
    super()
    if (url instanceof Array) {
      this.urlList = url
    } else {
      this.urlList = [url]
    }

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
    this.init()
  }

  // string or object
  send (obj) {
    let objToJson = typeof obj === 'string' ? obj : JSON.stringify(obj)
    if (this.isReady()) {
      this.ws.send(objToJson)
    } else {
      this.queue.push(objToJson)
    }
  }

  isReady () {
    return this.ws.readyState === this.STATUS.OPEN
  }

  init () {
    this.ws = new WebSocket(this.urlList[this.reconnectUrlIndex])

    if (this.reconnectUrlIndex === this.urlList.length - 1) {
      // urlList 循环尝试重连一轮, times += 1
      this.reconnectTimes += 1
    }

    var _this = this

    this.ws.onmessage = function (message) {
      let data = eval('(' + message.data + ')')
      _this.fire('message', data)
      // _this.ws.send('{"aid":"peek_message"}')
    }

    this.ws.onclose = function (event) {
      console.log('close', event)
      _this.fire('close')
      // 清空 queue
      _this.queue = []
      // 自动重连
      if (_this.reconnect) {
        if (_this.reconnectMaxTimes <= _this.reconnectTimes) {
          _this.fire('death')
        } else {
          _this.reconnectTask = setInterval(function () {
            if (_this.ws.readyState === 3) {
              // 每次重连的时候设置 _this.reconnectUrlIndex
              _this.reconnectUrlIndex = (_this.reconnectUrlIndex + 1) < _this.urlList.length ? _this.reconnectUrlIndex + 1 : 0
              _this.init()
              _this.fire('reconnect')
            }
          }, _this.reconnectInterval)
        }
      }
    }

    this.ws.onerror = error => {
      console.error(error)
      _this.fire('error', error)
      _this.ws.close()
    }

    this.ws.onopen = function () {
      _this.reconnectTimes = 0
      _this.reconnectUrlIndex = 0
      _this.fire('open')
      if (this.reconnectTask) {
        clearInterval(_this.reconnectTask)
      }
      while (_this.queue.length > 0) {
        if (_this.ws.readyState === 1) _this.ws.send(_this.queue.shift())
        else break
      }
    }
  }
}
