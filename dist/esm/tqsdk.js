import axios from 'axios';

var version = "1.1.0";

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var eventemitter3 = createCommonjsModule(function (module) {

  var has = Object.prototype.hasOwnProperty,
      prefix = '~';
  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @private
   */

  function Events() {} //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //


  if (Object.create) {
    Events.prototype = Object.create(null); //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //

    if (!new Events().__proto__) prefix = false;
  }
  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @private
   */


  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }
  /**
   * Add a listener for a given event.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */


  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    var listener = new EE(fn, context || emitter, once),
        evt = prefix ? prefix + event : event;
    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);else emitter._events[evt] = [emitter._events[evt], listener];
    return emitter;
  }
  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */


  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();else delete emitter._events[evt];
  }
  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @public
   */


  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }
  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */


  EventEmitter.prototype.eventNames = function eventNames() {
    var names = [],
        events,
        name;
    if (this._eventsCount === 0) return names;

    for (name in events = this._events) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };
  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */


  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event,
        handlers = this._events[evt];
    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }

    return ee;
  };
  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */


  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event,
        listeners = this._events[evt];
    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };
  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */


  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return false;
    var listeners = this._events[evt],
        len = arguments.length,
        args,
        i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1:
          return listeners.fn.call(listeners.context), true;

        case 2:
          return listeners.fn.call(listeners.context, a1), true;

        case 3:
          return listeners.fn.call(listeners.context, a1, a2), true;

        case 4:
          return listeners.fn.call(listeners.context, a1, a2, a3), true;

        case 5:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;

        case 6:
          return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len - 1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length,
          j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1:
            listeners[i].fn.call(listeners[i].context);
            break;

          case 2:
            listeners[i].fn.call(listeners[i].context, a1);
            break;

          case 3:
            listeners[i].fn.call(listeners[i].context, a1, a2);
            break;

          case 4:
            listeners[i].fn.call(listeners[i].context, a1, a2, a3);
            break;

          default:
            if (!args) for (j = 1, args = new Array(len - 1); j < len; j++) {
              args[j - 1] = arguments[j];
            }
            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };
  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };
  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };
  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;
    if (!this._events[evt]) return this;

    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (listeners.fn === fn && (!once || listeners.once) && (!context || listeners.context === context)) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (listeners[i].fn !== fn || once && !listeners[i].once || context && listeners[i].context !== context) {
          events.push(listeners[i]);
        }
      } //
      // Reset the array, or remove it completely if we have no more listeners.
      //


      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;else clearEvent(this, evt);
    }

    return this;
  };
  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */


  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  }; //
  // Alias methods names because people roll like that.
  //


  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on; //
  // Expose the prefix.
  //

  EventEmitter.prefixed = prefix; //
  // Allow `EventEmitter` to be imported as module namespace.
  //

  EventEmitter.EventEmitter = EventEmitter; //
  // Expose the module.
  //

  {
    module.exports = EventEmitter;
  }
});

var IsEmptyObject = function IsEmptyObject(obj) {
  return obj && obj.constructor === Object && Object.keys(obj).length === 0;
};

var RandomStr = function RandomStr() {
  var len = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 8;
  var charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  var s = '';

  for (var i = 0; i < len; i++) {
    s += charts[Math.random() * 0x3e | 0];
  }

  return s;
};

function _genList(str) {
  // string 根据 | 分割为数组
  var list = [];
  var items = str.split('|');

  for (var i = 0; i < items.length; i++) {
    list.push(items[i].trim()); // NOTE: 有些竖线之间内容为空
  }

  return list;
}

function _genItem(keys, values) {
  // 根据 keys - values 返回 object
  var item = {};

  for (var j = 0; j < keys.length; j++) {
    item[keys[j]] = values[j];
  }

  return item;
}

function _genTableRow(state, stateDetail, colNames, line) {
  // 根据 参数 处理表格的一行
  var result = {
    state: state,
    state_detail: stateDetail,
    isRow: false,
    row: null
  };

  switch (stateDetail) {
    case 'T':
      // title
      if (line.replace(/-/g, '') === '') {
        result.state_detail = 'C';
      } else {
        colNames[state] = _genList(line);
      }

      break;

    case 'C':
      // content
      if (line.replace(/-/g, '') === '') {
        result.state_detail = 'S';
      } else {
        result.isRow = true;
        result.row = _genItem(colNames[state], _genList(line));
      }

      break;

    case 'S':
      if (line.replace(/-/g, '') === '') {
        result.state = '';
        result.state_detail = '';
      }

      break;
  }

  return result;
}

var ParseSettlementContent = function ParseSettlementContent() {
  var txt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
  if (txt === '') return txt;
  var lines = txt.split('\n');
  var state = ''; // A = Account Summary; T = Transaction Record; PD = Positions Detail; P = Positions

  var stateDetail = ''; // T = title; C = content; S = summary

  var colNames = {}; // 需要处理的表格

  var tableStatesTitles = {
    positionClosed: '平仓明细 Position Closed',
    transactionRecords: '成交记录 Transaction Record',
    positions: '持仓汇总 Positions',
    positionsDetail: '持仓明细 Positions Detail',
    delivery: '交割明细  Delivery'
  };
  var states = [];
  var titles = [];
  var result = {
    account: {}
  };
  Object.entries(tableStatesTitles).forEach(function (item) {
    states.push(item[0]);
    titles.push(item[1]);
    result[item[0]] = [];
  });

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    if (line === '资金状况  币种：人民币  Account Summary  Currency：CNY') {
      state = 'A-S';
      i++;
      continue;
    } else if (titles.includes(line)) {
      state = states[titles.indexOf(line)];
      stateDetail = 'T';
      i++;
      continue;
    }

    if (state === 'A-S') {
      if (line.length === 0 || line.replace('-', '') === '') {
        state = '';
        continue;
      } else {
        // eslint-disable-next-line no-unused-vars
        var chMatches = line.match(/([\u4e00-\u9fa5][\u4e00-\u9fa5\s]+[\u4e00-\u9fa5])+/g); // 中文
        // eslint-disable-next-line no-useless-escape

        var enMatches = line.match(/([A-Z][a-zA-Z\.\/\(\)\s]+)[:：]+/g); // 英文

        var numMatches = line.match(/(-?[\d]+\.\d\d)/g); // 数字

        for (var j = 0; j < enMatches.length; j++) {
          result.account[enMatches[j].split(/[:：]/)[0]] = numMatches[j];
        }
      }
    } else if (states.includes(state)) {
      if (line.length === 0) {
        state = '';
        continue;
      } else {
        var tableRow = _genTableRow(state, stateDetail, colNames, line);

        state = tableRow.state;
        stateDetail = tableRow.state_detail;

        if (tableRow.isRow) {
          result[state].push(tableRow.row);
        }
      }
    }
  }

  return result;
};

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

var TqWebsocket =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(TqWebsocket, _EventEmitter);

  function TqWebsocket(url) {
    var _this2;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, TqWebsocket);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(TqWebsocket).call(this));
    _this2.urlList = url instanceof Array ? url : [url];
    _this2.ws = null;
    _this2.queue = []; // 自动重连开关

    _this2.reconnect = true;
    _this2.reconnectTask = null;
    _this2.reconnectInterval = options.reconnectInterval ? options.reconnectInterval : 3000;
    _this2.reconnectMaxTimes = options.reconnectMaxTimes ? options.reconnectMaxTimes : 5;
    _this2.reconnectTimes = 0;
    _this2.reconnectUrlIndex = 0;
    _this2.STATUS = {
      CONNECTING: 0,
      OPEN: 1,
      CLOSING: 2,
      CLOSED: 3
    };

    _this2.__init();

    return _this2;
  } // string or object


  _createClass(TqWebsocket, [{
    key: "send",
    value: function send(obj) {
      var objToJson = JSON.stringify(obj);

      if (this.isReady()) {
        this.ws.send(objToJson);
      } else {
        this.queue.push(objToJson);
      }
    }
  }, {
    key: "isReady",
    value: function isReady() {
      return this.ws.readyState === WebSocket.OPEN;
    }
  }, {
    key: "__init",
    value: function __init() {
      this.ws = new WebSocket(this.urlList[this.reconnectUrlIndex]);

      if (this.reconnectUrlIndex === this.urlList.length - 1) {
        // urlList 循环尝试重连一轮, times += 1
        this.reconnectTimes += 1;
      }

      var _this = this;

      this.ws.onmessage = function (message) {
        // eslint-disable-next-line no-eval
        var data = eval('(' + message.data + ')');

        _this.emit('message', data);

        setImmediate(function () {
          _this.ws.send('{"aid":"peek_message"}');
        });
      };

      this.ws.onclose = function (event) {
        console.log('close', event);

        _this.emit('close'); // 清空 queue


        _this.queue = []; // 自动重连

        if (_this.reconnect) {
          if (_this.reconnectMaxTimes <= _this.reconnectTimes) {
            clearTimeout(_this.reconnectTask);

            _this.emit('death', {
              msg: '超过重连次数' + _this.reconnectMaxTimes
            });
          } else {
            _this.reconnectTask = setTimeout(function () {
              if (_this.ws.readyState === 3) {
                // 每次重连的时候设置 _this.reconnectUrlIndex
                _this.reconnectUrlIndex = _this.reconnectUrlIndex + 1 < _this.urlList.length ? _this.reconnectUrlIndex + 1 : 0;

                _this.__init();

                _this.emit('reconnect', {
                  msg: '发起重连第 ' + _this.reconnectTimes + ' 次'
                });
              }
            }, _this.reconnectInterval);
          }
        }
      };

      this.ws.onerror = function (error) {
        _this.emit('error', error);

        _this.ws.close();
      };

      this.ws.onopen = function () {
        _this.emit('open', {
          msg: '发起重连第 ' + _this.reconnectTimes + ' 次, 成功'
        });

        _this.reconnectTimes = 0;
        _this.reconnectUrlIndex = 0;

        if (this.reconnectTask) {
          clearTimeout(_this.reconnectTask);
        }

        while (_this.queue.length > 0) {
          if (_this.ws.readyState === 1) _this.ws.send(_this.queue.shift());else break;
        }
      };
    }
  }, {
    key: "close",
    value: function close() {
      this.ws.onclose = function () {};

      this.ws.close();
    }
  }]);

  return TqWebsocket;
}(eventemitter3);

var TqTradeWebsocket =
/*#__PURE__*/
function (_TqWebsocket) {
  _inherits(TqTradeWebsocket, _TqWebsocket);

  function TqTradeWebsocket(url, dm) {
    var _this3;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, TqTradeWebsocket);

    _this3 = _possibleConstructorReturn(this, _getPrototypeOf(TqTradeWebsocket).call(this, url, options));
    _this3.dm = dm; // 记录重连时需要重发的数据

    _this3.req_login = null;

    _this3.init();

    return _this3;
  }

  _createClass(TqTradeWebsocket, [{
    key: "init",
    value: function init() {
      var self = this;
      this.on('message', function (payload) {
        if (payload.aid === 'rtn_data') {
          var notifies = self._separateNotifies(payload.data);

          for (var i = 0; i < notifies.length; i++) {
            self.emit('notify', notifies[i]);
          }

          self.dm.mergeData(payload.data);
        } else if (payload.aid === 'rtn_brokers') {
          self.emit('rtn_brokers', payload.brokers);
        } else if (payload.aid === 'qry_settlement_info') {
          // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
          var content = ParseSettlementContent(payload.settlement_info); // 1 写入 dm

          self.dm.mergeData({
            trade: _defineProperty({}, payload.user_name, {
              his_settlements: _defineProperty({}, payload.trading_day, content)
            })
          }); // 2 存入缓存

          if (TQSDK.store) TQSDK.store.setContent(payload.user_name, payload.trading_day, payload.settlement_info);
        }
      });
      this.on('reconnect', function () {
        if (self.req_login) self.send(self.req_login);
      });
    }
  }, {
    key: "_separateNotifies",
    value: function _separateNotifies(data) {
      var notifies = [];

      for (var i = 0; i < data.length; i++) {
        if (data[i].notify) {
          var notify = data.splice(i--, 1)[0].notify;

          for (var k in notify) {
            notifies.push(notify[k]);
          }
        }
      }

      return notifies;
    }
  }, {
    key: "send",
    value: function send(obj) {
      if (obj.aid === 'req_login') {
        this.req_login = obj;
      }

      _get(_getPrototypeOf(TqTradeWebsocket.prototype), "send", this).call(this, obj);
    }
  }]);

  return TqTradeWebsocket;
}(TqWebsocket);

var TqQuoteWebsocket =
/*#__PURE__*/
function (_TqWebsocket2) {
  _inherits(TqQuoteWebsocket, _TqWebsocket2);

  function TqQuoteWebsocket(url, dm) {
    var _this4;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, TqQuoteWebsocket);

    _this4 = _possibleConstructorReturn(this, _getPrototypeOf(TqQuoteWebsocket).call(this, url, options));
    _this4.dm = dm; // 记录重连时需要重发的数据

    _this4.subscribe_quote = null;
    _this4.charts = {};

    _this4.init();

    return _this4;
  }

  _createClass(TqQuoteWebsocket, [{
    key: "init",
    value: function init() {
      var self = this;
      this.on('message', function (payload) {
        if (payload.aid === 'rtn_data') {
          self.dm.mergeData(payload.data);
        }
      });
      this.on('reconnect', function (e) {
        console.log(e);

        if (self.subscribe_quote) {
          self.send(self.subscribe_quote);
        }

        for (var chartId in self.charts) {
          if (self.charts[chartId].view_width > 0) {
            self.send(self.charts[chartId]);
          }
        }
      });
    }
  }, {
    key: "send",
    value: function send(obj) {
      if (obj.aid === 'subscribe_quote') {
        if (this.subscribe_quote === null || JSON.stringify(obj.ins_list) !== JSON.stringify(this.subscribe_quote.ins_list)) {
          this.subscribe_quote = obj;

          _get(_getPrototypeOf(TqQuoteWebsocket.prototype), "send", this).call(this, obj);
        }
      } else if (obj.aid === 'set_chart') {
        if (obj.view_width === 0) {
          if (this.charts[obj.chart_id]) delete this.charts[obj.chart_id];
        } else {
          this.charts[obj.chart_id] = obj;
        }

        _get(_getPrototypeOf(TqQuoteWebsocket.prototype), "send", this).call(this, obj);
      }
    }
  }]);

  return TqQuoteWebsocket;
}(TqWebsocket);

var TqRecvOnlyWebsocket =
/*#__PURE__*/
function (_TqWebsocket3) {
  _inherits(TqRecvOnlyWebsocket, _TqWebsocket3);

  function TqRecvOnlyWebsocket(url, dm) {
    var _this5;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    _classCallCheck(this, TqRecvOnlyWebsocket);

    _this5 = _possibleConstructorReturn(this, _getPrototypeOf(TqRecvOnlyWebsocket).call(this, url, options));
    _this5.dm = dm;

    _this5.init();

    return _this5;
  }

  _createClass(TqRecvOnlyWebsocket, [{
    key: "init",
    value: function init() {
      var self = this;
      this.on('message', function (payload) {
        if (payload.aid === 'rtn_data') {
          self.dm.mergeData(payload.data);
        }
      });
      this.on('reconnect', function (e) {
        console.log(e);
      });
    }
  }]);

  return TqRecvOnlyWebsocket;
}(TqWebsocket);

/* eslint-disable camelcase */
var QUOTE =
/*#__PURE__*/
function () {
  function QUOTE() {
    _classCallCheck(this, QUOTE);

    this.instrument_id = ''; // 'SHFE.au1906'

    this.datetime = ''; // "2017-07-26 23:04:21.000001" (行情从交易所发出的时间(北京时间))

    this._last_price = '-'; // 最新价 NaN

    this.ask_price1 = '-'; // 卖一价 NaN

    this.ask_volume1 = '-'; // 卖一量 0

    this.bid_price1 = '-'; // 买一价 NaN

    this.bid_volume1 = '-'; // 买一量 0

    this.highest = '-'; // 当日最高价 NaN

    this.lowest = '-'; // 当日最低价 NaN

    this.open = '-'; // 开盘价 NaN

    this.close = '-'; // 收盘价 NaN

    this.average = '-'; // 当日均价 NaN

    this.volume = '-'; // 成交量 0

    this.amount = '-'; // 成交额 NaN

    this.open_interest = '-'; // 持仓量 0

    this.lower_limit = '-'; // 跌停 NaN

    this.upper_limit = '-'; // 涨停 NaN

    this.settlement = '-'; // 结算价 NaN

    this.change = '-'; // 涨跌

    this.change_percent = '-'; // 涨跌幅

    this.strike_price = NaN; // 行权价

    this.pre_open_interest = '-'; // 昨持仓量

    this.pre_close = '-'; // 昨收盘价

    this.pre_volume = '-'; // 昨成交量

    this._pre_settlement = '-'; // 昨结算价

    this.margin = '-'; // 每手保证金

    this.commission = '-'; // 每手手续费
    // 合约服务附带参数
    // class: '', // ['FUTURE' 'FUTURE_INDEX' 'FUTURE_CONT']
    // ins_id: '',
    // ins_name: '',
    // exchange_id: '',
    // sort_key: '',
    // expired: false,
    // py: '',
    // product_id: '',
    // product_short_name: '',
    // underlying_product: '',
    // underlying_symbol: '', // 标的合约
    // delivery_year: 0,
    // delivery_month: 0,
    // expire_datetime: 0,
    // trading_time: {},
    // volume_multiple: 0, // 合约乘数
    // price_tick: 0, // 合约价格单位
    // price_decs: 0, // 合约价格小数位数
    // max_market_order_volume: 1000, // 市价单最大下单手数
    // min_market_order_volume: 1, // 市价单最小下单手数
    // max_limit_order_volume: 1000, // 限价单最大下单手数
    // min_limit_order_volume: 1, // 限价单最小下单手数
  }

  _createClass(QUOTE, [{
    key: "setChange",
    value: function setChange() {
      if (Number.isFinite(this._last_price) && Number.isFinite(this._pre_settlement) && this._pre_settlement !== 0) {
        this.change = this._last_price - this._pre_settlement;
        this.change_percent = this.change / this._pre_settlement * 100;
      }
    }
  }, {
    key: "last_price",
    set: function set(p) {
      this._last_price = p;
      this.setChange();
    },
    get: function get() {
      return this._last_price;
    }
  }, {
    key: "pre_settlement",
    set: function set(p) {
      this._pre_settlement = p;
      this.setChange();
    },
    get: function get() {
      return this._pre_settlement;
    }
  }]);

  return QUOTE;
}();

var DataManager =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(DataManager, _EventEmitter);

  function DataManager() {
    var _this;

    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, DataManager);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DataManager).call(this));
    _this._epoch = 0; // 数据版本控制

    _this._data = data;
    _this._diffs = [];
    return _this;
  }

  _createClass(DataManager, [{
    key: "mergeData",
    value: function mergeData(source) {
      var epochIncrease = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var deleteNullObj = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var sourceArr = Array.isArray(source) ? source : [source];

      if (epochIncrease) {
        // 如果 _epoch 需要增加，就是需要记下来 diffs
        this._epoch += 1;
        this._diffs = sourceArr;
      }

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = sourceArr[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var item = _step.value;
          // 过滤掉空对象
          if (item === null || IsEmptyObject(item)) continue;
          DataManager.MergeObject(this._data, item, this._epoch, deleteNullObj);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (epochIncrease && this._data._epoch === this._epoch) {
        this.emit('data', null);
      }
    }
    /**
     * 判断 某个路径下 或者 某个数据对象 最近有没有更新
     * @param {Array | Object} pathArray | object
     */

  }, {
    key: "isChanging",
    value: function isChanging(pathArray) {
      // _data 中，只能找到对象类型中记录的 _epoch
      if (Array.isArray(pathArray)) {
        var d = this._data;

        for (var i = 0; i < pathArray.length; i++) {
          d = d[pathArray[i]];
          if (d._epoch && d._epoch === this._epoch) return true;
          if (d === undefined) return false;
        }

        return false;
      } else if (pathArray && pathArray._epoch) {
        return pathArray._epoch === this._epoch;
      }

      return false;
    }
  }, {
    key: "setDefault",
    value: function setDefault(pathArray) {
      var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var root = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this._data;
      return DataManager.SetDefault(root, pathArray, defaultValue);
    }
  }, {
    key: "getByPath",
    value: function getByPath(pathArray) {
      var root = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this._data;
      return DataManager.GetByPath(root, pathArray);
    }
  }]);

  return DataManager;
}(eventemitter3);

DataManager.SetDefault = function (root, pathArray, defaultValue) {
  var node = root;

  for (var i = 0; i < pathArray.length; i++) {
    if (typeof pathArray[i] !== 'string' && typeof pathArray[i] !== 'number') {
      console.error('SetDefault, pathArray 中的元素必須是 string or number, but pathArray = ', pathArray);
      break;
    }

    var _key = pathArray[i];

    if (!(_key in node)) {
      node[_key] = i === pathArray.length - 1 ? defaultValue : {};
    }

    if (i === pathArray.length - 1) {
      return node[_key];
    } else {
      node = node[_key];
    }
  }

  return node;
};

DataManager.GetByPath = function (root, pathArray) {
  var d = root;

  for (var i = 0; i < pathArray.length; i++) {
    d = d[pathArray[i]];
    if (d === undefined || d === null) return d;
  }

  return d;
};

DataManager.MergeObject = function (target, source) {
  var _epoch = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

  var deleteNullObj = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;

  for (var property in source) {
    var value = source[property];

    var type = _typeof(value);
    /**
     * 1 'string', 'boolean', 'number'
     * 2 'object' 包括了 null , Array, {} 服务器不会发送 Array
     * 3 'undefined' 不处理
     */


    if (['string', 'boolean', 'number'].includes(type)) {
      target[property] = value === 'NaN' ? NaN : value;
    } else if (value === null && deleteNullObj) {
      delete target[property]; // 服务器 要求 删除对象
    } else if (Array.isArray(value)) {
      target[property] = value; // 如果是数组类型就直接替换，并且记录 _epoch

      if (!value._epoch) {
        Object.defineProperty(value, '_epoch', {
          configurable: false,
          enumerable: false,
          writable: true
        });
      }

      value._epoch = _epoch;
    } else if (type === 'object') {
      // @note: 这里做了一个特例, 使得 K 线序列数据被保存为一个 array, 而非 object
      target[property] = target[property] || (property === 'data' ? [] : {}); // quotes 对象单独处理

      if (property === 'quotes') {
        for (var symbol in value) {
          var quote = value[symbol]; // source[property]

          if (quote === null) {
            // 服务器 要求 删除对象
            if (deleteNullObj && symbol) delete target[property][symbol];
            continue;
          } else if (!target[property][symbol]) {
            target[property][symbol] = new QUOTE();
          }

          DataManager.MergeObject(target[property][symbol], quote, _epoch, deleteNullObj);
        }
      } else {
        DataManager.MergeObject(target[property], value, _epoch, deleteNullObj);
      }
    }
  } // _epoch 不应该被循环到的 key


  if (!target._epoch) {
    Object.defineProperty(target, '_epoch', {
      configurable: false,
      enumerable: false,
      writable: true
    });
  }

  target._epoch = _epoch;
};

/**
 * 事件类型
 + ready: 收到合约基础数据（全局只出发一次）
 + rtn_brokers: 收到期货公司列表（全局只出发一次）
 + notify: 收到通知对象
 + rtn_data: 数据更新（每一次数据更新触发）
 + error: 发生错误(目前只有一种：合约服务下载失败)
 */
// 支持多账户登录

var TQSDK =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(TQSDK, _EventEmitter);

  function TQSDK() {
    var _this;

    var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref$symbolsServerUrl = _ref.symbolsServerUrl,
        symbolsServerUrl = _ref$symbolsServerUrl === void 0 ? 'https://openmd.shinnytech.com/t/md/symbols/latest.json' : _ref$symbolsServerUrl,
        _ref$wsQuoteUrl = _ref.wsQuoteUrl,
        wsQuoteUrl = _ref$wsQuoteUrl === void 0 ? 'wss://openmd.shinnytech.com/t/md/front/mobile' : _ref$wsQuoteUrl,
        _ref$wsTradeUrl = _ref.wsTradeUrl,
        wsTradeUrl = _ref$wsTradeUrl === void 0 ? 'wss://openmd.shinnytech.com/trade/user0' : _ref$wsTradeUrl,
        _ref$clientSystemInfo = _ref.clientSystemInfo,
        clientSystemInfo = _ref$clientSystemInfo === void 0 ? '' : _ref$clientSystemInfo,
        _ref$clientAppId = _ref.clientAppId,
        clientAppId = _ref$clientAppId === void 0 ? '' : _ref$clientAppId,
        _ref$autoInit = _ref.autoInit,
        autoInit = _ref$autoInit === void 0 ? true : _ref$autoInit,
        _ref$data = _ref.data,
        data = _ref$data === void 0 ? {
      klines: {},
      quotes: {},
      charts: {},
      ticks: {}
    } : _ref$data;

    _classCallCheck(this, TQSDK);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TQSDK).call(this));
    _this._insUrl = symbolsServerUrl;
    _this._mdUrl = wsQuoteUrl;
    _this._trUrl = wsTradeUrl;
    _this.clientSystemInfo = clientSystemInfo;
    _this.clientAppIds = clientAppId;
    _this._prefix = 'TQJS_';

    var self = _assertThisInitialized(_this);

    _this.dm = new DataManager(data);

    _this.dm.on('data', function () {
      self.emit('rtn_data', null);
    });

    _this.brokers = null;
    _this.trade_accounts = {}; // 添加账户

    _this.isReady = false;
    _this.quotesWs = null;
    _this.quotesInfo = {};

    if (autoInit) {
      _this.init(); // 自动执行初始化

    }

    return _this;
  }

  _createClass(TQSDK, [{
    key: "init",
    value: function init() {
      this.initMdWebsocket();
      this.initTdWebsocket();
      var self = this;
      axios.get(this._insUrl, {
        headers: {
          Accept: 'application/json; charset=utf-8'
        }
      }).then(function (response) {
        self.quotesInfo = response.data; // 建立行情连接

        self.isReady = true;
        self.emit('ready');
        self.emit('rtn_data', null);
      })["catch"](function (error) {
        self.emit('error', error);
        console.error('Error: ' + error.message);
        return error;
      });
    }
  }, {
    key: "initMdWebsocket",
    value: function initMdWebsocket() {
      this.quotesWs = new TqQuoteWebsocket(this._mdUrl, this.dm);
    }
  }, {
    key: "initTdWebsocket",
    value: function initTdWebsocket() {
      var self = this;
      this.defaultTradeWs = new TqTradeWebsocket(this._tdUrl, this.dm);
      this.defaultTradeWs.on('rtn_brokers', function (brokers) {
        self.brokers = brokers;
        self.emit('rtn_brokers', brokers);
      });
    }
  }, {
    key: "addWebSocket",
    value: function addWebSocket() {
      var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      // eslint-disable-next-line no-unused-vars
      var ws = new TqRecvOnlyWebsocket(url, this.dm);
    } // user_id 作为唯一 key

  }, {
    key: "addAccount",
    value: function addAccount(bid, userId, password) {
      if (bid && userId && password) {
        if (!this.trade_accounts[userId]) {
          var ws = this.defaultTradeWs.req_login === null ? this.defaultTradeWs : new TqTradeWebsocket(this._ws_trade_url, this.dm);
          var self = this;
          ws.on('notify', function (n) {
            self.emit('notify', Object.assign(n, {
              bid: bid,
              user_id: userId
            }));
          });
          this.trade_accounts[userId] = {
            bid: bid,
            userId: userId,
            password: password,
            ws: ws
          };
        }

        return this.trade_accounts[userId];
      } else {
        return null;
      }
    }
  }, {
    key: "removeAccount",
    value: function removeAccount(bid, userId) {
      if (bid && userId) {
        if (this.trade_accounts[userId]) {
          // close 相应的 websocket
          this.trade_accounts[userId].ws.close();
          delete this.trade_accounts[userId]; // 删除用户相应的数据

          delete this.dm._data.trade[userId];
        }
      }
    }
  }, {
    key: "updateData",
    value: function updateData(data) {
      this.dm.mergeData(data, true, false);
    }
  }, {
    key: "getByPath",
    value: function getByPath(_path) {
      return this.dm.getByPath(_path);
    }
    /** ***************** 行情接口 get_quotes_by_input ********************/

  }, {
    key: "getQuotesByInput",
    value: function getQuotesByInput(_input) {
      if (typeof _input !== 'string' && !_input.input) return [];
      var option = {
        input: typeof _input === 'string' ? _input.toLowerCase() : _input.input.toLowerCase(),
        instrument_id: _input.instrument_id ? _input.instrument_id : true,
        // 是否根据合约ID匹配
        pinyin: _input.pinyin ? _input.pinyin : true,
        // 是否根据拼音匹配
        include_expired: _input.include_expired ? _input.include_expired : false,
        // 匹配结果是否包含已下市合约
        FUTURE: _input.future ? !!_input.future : true,
        // 匹配结果是否包含期货合约
        FUTURE_INDEX: _input.future_index ? !!_input.future_index : false,
        // 匹配结果是否包含期货指数
        FUTURE_CONT: _input.future_cont ? !!_input.future_cont : false,
        // 匹配结果是否包含期货主连
        OPTION: _input.option ? !!_input.option : false,
        // 匹配结果是否包含期权
        COMBINE: _input.combine ? !!_input.combine : false // 匹配结果是否包含组合

      };

      var filterSymbol = function filterSymbol(filterOption, quote, by) {
        if (filterOption[quote["class"]] && (filterOption.include_expired || !filterOption.include_expired && !quote.expired)) {
          if (by === 'instrument_id') {
            if (quote.product_id.toLowerCase() === filterOption.input) {
              return true;
            } else if (filterOption.input.length > 2 && quote.instrument_id.toLowerCase().indexOf(filterOption.input) > -1) {
              return true;
            } else {
              return false;
            }
          } else if (by === 'pinyin' && quote.py.split(',').indexOf(filterOption.input) > -1) {
            return true;
          } else {
            return false;
          }
        }

        return false;
      };

      var result = [];

      if (option.instrument_id) {
        for (var symbol in this.quotesInfo) {
          if (filterSymbol(option, this.quotesInfo[symbol], 'instrument_id')) {
            result.push(symbol);
          }
        }
      }

      if (option.pinyin) {
        for (var _symbol in this.quotesInfo) {
          if (filterSymbol(option, this.quotesInfo[_symbol], 'pinyin')) {
            result.push(_symbol);
          }
        }
      }

      return result;
    }
    /** ***************** 行情接口 get_quote ********************/

  }, {
    key: "getQuote",
    value: function getQuote(symbol) {
      if (symbol === '') return {};
      var symbolObj = this.dm.setDefault(['quotes', symbol], new QUOTE());

      if (!symbolObj["class"] && this.quotesInfo[symbol]) {
        // quotesInfo 中的 last_price
        // eslint-disable-next-line camelcase
        var last_price = symbolObj.last_price ? symbolObj.last_price : this.quotesInfo[symbol].last_price;
        Object.assign(symbolObj, this.quotesInfo[symbol], {
          last_price: last_price
        });
      }

      return symbolObj;
    }
    /** ***************** 行情接口 set_chart ********************/

  }, {
    key: "setChart",
    value: function setChart(payload) {
      var content = {};

      if (payload.trading_day_start || payload.trading_day_count) {
        // 指定交易日，返回对应的数据
        content.trading_day_start = payload.trading_day_start ? payload.trading_day_start : 0; // trading_day_count 请求交易日天数

        content.trading_day_count = payload.trading_day_count ? payload.trading_day_count : 3600 * 24 * 1e9;
      } else {
        content.view_width = payload.view_width ? payload.view_width : 500;

        if (payload.left_kline_id) {
          // 指定一个K线id，向右请求N个数据
          content.left_kline_id = payload.left_kline_id;
        } else if (payload.focus_datetime) {
          // 使得指定日期的K线位于屏幕第M个柱子的位置
          content.focus_datetime = payload.focus_datetime; // 日线及以上周期是交易日，其他周期是时间，UnixNano 北京时间

          content.focus_position = payload.focus_position ? payload.focus_position : 0;
        }
      }

      this.quotesWs.send(Object.assign({
        aid: 'set_chart',
        chart_id: payload.chart_id ? payload.chart_id : this._prefix + 'kline_chart',
        ins_list: payload.ins_list ? payload.ins_list.join(',') : payload.symbol,
        duration: payload.duration
      }, content));
    }
    /** ***************** 交易接口 get_user ********************/

  }, {
    key: "getUser",
    value: function getUser(payload) {
      var userId = typeof payload === 'string' ? payload : payload.user_id;
      return userId ? this.dm._data.trade[userId] : null;
    }
    /** ***************** 接口 get ********************/

  }, {
    key: "get",
    value: function get() {
      var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref2$name = _ref2.name,
          name = _ref2$name === void 0 ? 'users' : _ref2$name,
          _ref2$user_id = _ref2.user_id,
          user_id = _ref2$user_id === void 0 ? '' : _ref2$user_id,
          _ref2$currency = _ref2.currency,
          currency = _ref2$currency === void 0 ? 'CNY' : _ref2$currency,
          _ref2$symbol = _ref2.symbol,
          symbol = _ref2$symbol === void 0 ? '' : _ref2$symbol,
          _ref2$order_id = _ref2.order_id,
          order_id = _ref2$order_id === void 0 ? '' : _ref2$order_id,
          _ref2$trade_id = _ref2.trade_id,
          trade_id = _ref2$trade_id === void 0 ? '' : _ref2$trade_id,
          _ref2$trading_day = _ref2.trading_day,
          trading_day = _ref2$trading_day === void 0 ? '' : _ref2$trading_day,
          _ref2$chart_id = _ref2.chart_id,
          chart_id = _ref2$chart_id === void 0 ? '' : _ref2$chart_id,
          _ref2$input = _ref2.input,
          input = _ref2$input === void 0 ? '' : _ref2$input,
          _ref2$duration = _ref2.duration,
          duration = _ref2$duration === void 0 ? 0 : _ref2$duration;

      if (name === 'users') {
        return Object.keys(this.trade_accounts);
      }

      if (user_id) {
        // get 交易相关数据
        var user = this.get_user(user_id);

        if (name === 'user') {
          return user;
        }

        if (['session', 'accounts', 'positions', 'orders', 'trades', 'his_settlements'].indexOf(name) > -1) {
          return user && user[name] ? user[name] : null;
        } else if (user && user[name + 's']) {
          var k = name === 'account' ? currency : name === 'position' ? symbol : name === 'order' ? order_id : name === 'trade' ? trade_id : name === 'his_settlement' ? trading_day : '';
          return user[name + 's'][k];
        }

        return null;
      } else {
        // get 行情相关数据
        if (name === 'quotes') {
          return input ? this.get_quotes_by_input(input) : [];
        }

        if (name === 'quote') return this.getQuote(symbol);
        if (name === 'klines') return this.getKlines(symbol, duration);
        if (name === 'ticks') return this.getTicks(symbol);
        if (name === 'charts') return this.dm.getByPath(['charts']);
        if (name === 'chart') return this.dm.getByPath(['charts', chart_id]);
      }
    }
  }, {
    key: "getKlines",
    value: function getKlines(symbol, dur) {
      if (symbol === '') return null;
      var ks = this.dm.getByPath(['klines', symbol, dur]);

      if (!ks || !ks.data || ks.last_id === -1) {
        this.dm.mergeData({
          klines: _defineProperty({}, symbol, _defineProperty({}, dur, {
            last_id: -1,
            data: {}
          }))
        }, false, false);
        ks = this.dm.getByPath(['klines', symbol, dur]);
      }

      return ks;
    }
  }, {
    key: "getTicks",
    value: function getTicks(symbol) {
      if (symbol === '') return null;
      var ts = this.dm.getByPath(['ticks', symbol]);

      if (!ts || !ts.data) {
        this.dm.mergeData({
          ticks: _defineProperty({}, symbol, {
            last_id: -1,
            data: {}
          })
        }, false, false);
      }

      return this.dm.getByPath(['ticks', symbol]);
    }
  }, {
    key: "isLogined",
    value: function isLogined(payload) {
      var session = this.get({
        name: 'session',
        user_id: payload.user_id
      });
      return !!(session && session.trading_day);
    }
  }, {
    key: "isChanging",
    value: function isChanging(target, source) {
      if (target && target._epoch) return target._epoch === this.dm._epoch;
      if (typeof target === 'string') return this.dm.isChanging(target, source);
      return false;
    }
  }, {
    key: "insertOrder",
    value: function insertOrder(payload) {
      if (!this.is_logined(payload)) return null;
      var orderId = this._prefix + RandomStr(8);
      var _order_common = {
        user_id: payload.user_id,
        orderId: orderId,
        exchange_id: payload.exchange_id,
        instrument_id: payload.ins_id,
        direction: payload.direction,
        offset: payload.offset,
        price_type: payload.price_type ? payload.price_type : 'LIMIT',
        // "LIMIT" "ANY"
        limit_price: Number(payload.limit_price),
        volume_condition: 'ANY',
        // 数量条件 (ANY=任何数量, MIN=最小数量, ALL=全部数量)
        time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD' // 时间条件 (IOC=立即完成，否则撤销, GFS=本节有效, *GFD=当日有效, GTC=撤销前有效, GFA=集合竞价有效)

      };

      var _orderInsert = Object.assign({
        aid: 'insert_order',
        volume: payload.volume
      }, _order_common);

      this.trade_accounts[payload.user_id].ws.send(_orderInsert);

      var _orderInit = Object.assign({
        volume_orign: payload.volume,
        // 总报单手数
        // 委托单当前状态
        status: 'ALIVE',
        // 委托单状态, (ALIVE=有效, FINISHED=已完)
        volume_left: payload.volume // 未成交手数

      }, _order_common);

      this.dm.mergeData({
        trade: _defineProperty({}, payload.user_id, {
          orders: _defineProperty({}, orderId, _orderInit)
        })
      }, false, false);
      return this.get({
        name: 'order',
        user_id: payload.user_id,
        orderId: orderId
      });
    }
  }, {
    key: "autoInsertOrder",
    value: function autoInsertOrder(payload) {
      if (!this.is_logined(payload)) return null;
      /* payload : {symbol, exchange_id, ins_id, direction, price_type, limit_price, offset, volume} */

      var initOrder = {
        user_id: payload.user_id,
        price_type: payload.price_type ? payload.price_type : 'LIMIT',
        // "LIMIT" "ANY"
        volume_condition: 'ANY',
        time_condition: payload.price_type === 'ANY' ? 'IOC' : 'GFD',
        exchange_id: payload.exchange_id,
        instrument_id: payload.ins_id,
        direction: payload.direction,
        limit_price: Number(payload.limit_price)
      };

      if (payload.exchange_id === 'SHFE' && payload.offset === 'CLOSE') {
        var position = this.dm.getPosition(payload.symbol, payload.user_id); // 拆单，先平今再平昨

        var closeTodayVolume = 0;

        if (payload.direction === 'BUY' && position.volume_short_today > 0) {
          closeTodayVolume = Math.min(position.volume_short_today, payload.volume);
        } else if (payload.direction === 'SELL' && position.volume_long_today > 0) {
          closeTodayVolume = Math.min(position.volume_long_today, payload.volume);
        }

        if (closeTodayVolume > 0) {
          this.insert_order(Object.assign({
            offset: 'CLOSETODAY',
            volume: closeTodayVolume
          }, initOrder));
        }

        if (payload.volume - closeTodayVolume > 0) {
          this.insert_order(Object.assign({
            offset: 'CLOSE',
            volume: payload.volume - closeTodayVolume
          }, initOrder));
        }
      } else {
        this.insert_order(Object.assign({
          offset: payload.offset,
          volume: payload.volume
        }, initOrder));
      }
    }
  }, {
    key: "cancelOrder",
    value: function cancelOrder(payload) {
      this.trade_accounts[payload.user_id].ws.send({
        aid: 'cancel_order',
        user_id: payload.user_id,
        order_id: payload.order_id ? payload.order_id : payload
      });
    } // 登录

  }, {
    key: "login",
    value: function login(payload) {
      this.trade_accounts[payload.user_id].ws.send({
        aid: 'req_login',
        bid: payload.bid,
        user_name: payload.user_id,
        password: payload.password,
        client_system_info: this.clientSystemInfo,
        client_app_id: this.clientAppId
      });
    } // 确认结算单

  }, {
    key: "confirmSettlement",
    value: function confirmSettlement(payload) {
      this.trade_accounts[payload.user_id].ws.send({
        aid: 'confirm_settlement'
      });
    } // 银期转账

  }, {
    key: "transfer",
    value: function transfer(payload) {
      this.trade_accounts[payload.user_id].ws.send({
        aid: 'req_transfer',
        bank_id: payload.bank_id,
        // 银行ID
        bank_password: payload.bank_password,
        // 银行账户密码
        future_account: payload.future_account,
        // 期货账户
        future_password: payload.future_password,
        // 期货账户密码
        currency: 'CNY',
        // 币种代码
        amount: payload.amount // 转账金额, >0 表示转入期货账户, <0 表示转出期货账户

      });
    } // 历史结算单

  }, {
    key: "hisSettlement",
    value: function hisSettlement(payload) {
      if (!TQSDK.store) return null; // 历史结算单 读取优先级： dm -> 缓存(写入dm) -> 服务器(写入dm、缓存)
      // 缓存策略 1 dm有历史结算单

      var content = this.dm.getByPath(['trade', payload.user_id, 'his_settlements', payload.trading_day]);
      if (content !== undefined) return; // 缓存策略 2 缓存中读取历史结算单

      var self = this;
      content = TQSDK.store.getContent(payload.user_id, payload.trading_day).then(function (value) {
        if (value === null) {
          // 缓存策略 2.1 未读取到发送请求
          self.trade_accounts[payload.user_id].ws.send({
            aid: 'qry_settlement_info',
            trading_day: Number(payload.trading_day)
          });
        } else {
          var _content = ParseSettlementContent(value); // 缓存策略 2.2 读取到存到dm


          self.dm.mergeData({
            trade: _defineProperty({}, payload.user_id, {
              his_settlements: _defineProperty({}, payload.trading_day, _content)
            })
          }, true, false);
        }
      })["catch"](function (err) {
        // 当出错时，此处代码运行
        console.error(err);
      });
    }
  }, {
    key: "subscribeQuote",
    value: function subscribeQuote(quotes) {
      this.quotesWs.send({
        aid: 'subscribe_quote',
        ins_list: Array.isArray(quotes) ? quotes.join(',') : quotes
      });
    }
  }]);

  return TQSDK;
}(eventemitter3); // 保留原先小寫加下划綫接口,新增接口都是駝峰標誌


TQSDK.prototype.subscribe_quote = TQSDK.prototype.subscribeQuote;
TQSDK.prototype.his_settlement = TQSDK.prototype.hisSettlement;
TQSDK.prototype.confirm_settlement = TQSDK.prototype.confirmSettlement;
TQSDK.prototype.add_account = TQSDK.prototype.addAccount;
TQSDK.prototype.remove_account = TQSDK.prototype.removeAccount;
TQSDK.prototype.update_data = TQSDK.prototype.updateData;
TQSDK.prototype.get_by_path = TQSDK.prototype.getByPath;
TQSDK.prototype.get_quotes_by_input = TQSDK.prototype.getQuotesByInput;
TQSDK.prototype.get_quote = TQSDK.prototype.getQuote;
TQSDK.prototype.set_chart = TQSDK.prototype.setChart;
TQSDK.prototype.get_user = TQSDK.prototype.getUser;
TQSDK.prototype.is_logined = TQSDK.prototype.isLogined;
TQSDK.prototype.is_changed = TQSDK.prototype.isChanging;
TQSDK.prototype.insert_order = TQSDK.prototype.insertOrder;
TQSDK.prototype.auto_insert_order = TQSDK.prototype.autoInsertOrder;
TQSDK.prototype.cancel_order = TQSDK.prototype.cancelOrder;

// import "core-js/stable";
TQSDK.TqWebsocket = TqWebsocket;
TQSDK.DataManager = DataManager;
TQSDK.version = version;

export default TQSDK;
