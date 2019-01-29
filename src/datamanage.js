import EventPrototype from './event'
import GenPrototype from './datastructure'
import {UnifyArrayStyle, IsEmptyObject} from './utils'

const MakeArrayProxy = (data_array, parent_target, item_func = undefined) => {
  return new Proxy(data_array, {
    get: function (target, prop, receiver) {
      if (!isNaN(prop)) {
        let i = Number(prop)
        return i < 0 ? NaN : (item_func ? item_func(target[i]) : target[i])
      } else if (['last_id', 'trading_day_start_id', 'trading_day_end_id'].includes(prop)) {
        return parent_target[prop]
      } else {
        return target[prop]
      }
    }
  })
}

const MergeObject = (target, source, _epoch = 0, deleteNullObj = true) => {
  for (let property in source) {
    let value = source[property]
    switch (typeof value) {
      case 'object':
        if (value === null) {
          // 服务器 要求 删除对象
          if (deleteNullObj && property) delete target[property]
          continue
        } else if (Array.isArray(value) || property === 'data') {
          // @note: 这里做了一个特例, 使得 K 线序列数据被保存为一个 array, 而非 object
          if (!(property in target)) target[property] = []
        } else {
          if (!(property in target)) target[property] = {}
        }
        if (property === 'quotes') {
          // quotes 对象单独处理
          for (let instrument_id in value) {
            let instrument = value[instrument_id] // source[property]
            if (instrument === null) {
              // 服务器 要求 删除对象
              if (deleteNullObj && instrument_id) delete target[property][instrument_id]
              continue
            } else if (!target[property][instrument_id]) {
              target[property][instrument_id] = GenPrototype('quote')
            }
            MergeObject(target[property][instrument_id], instrument, _epoch, deleteNullObj)
          }
        } else {
          MergeObject(target[property], value, _epoch, deleteNullObj)
        }
        break
      case 'string':
      case 'boolean':
      case 'number':
        target[property] = value === 'NaN' ? NaN : value
        break
      case 'undefined':
        break
    }
  }
  // _epoch 不应该被循环到的 key
  if (!target['_epoch']) Object.defineProperty(target, '_epoch', {
    configurable: false,
    enumerable: false,
    writable: true
  })
  target['_epoch'] = _epoch
}



class DataManager extends EventPrototype {
  constructor ({ } = {}) {
    super()
    this._epoch = 0 // 数据版本控制
    this._data = {
      quotes: {},
      klines: {},
      ticks: {},
      charts: {}
    }
  }

  getKlines (symbol, dur_nano) {
    let ks = this.setDefault({last_id: -1, data: []}, 'klines', symbol, dur_nano)
    let ksData = this.setDefault([], 'klines', symbol, dur_nano, 'data')
    if (!ks.proxy) {
      ks.proxy = MakeArrayProxy(ksData, ks)
      let arr = ['open', 'close', 'high', 'low', 'volume', 'close_oi', 'open_oi', 'datetime']
      arr.forEach(key => {
        ks.data[key] = MakeArrayProxy(ksData, ks, d => d ? d[key] : NaN)
      })
    }
    return ks.proxy
  }

  getTicks (symbol) {
    let ts = this.setDefault({last_id: -1, data: []}, 'ticks', symbol)
    if (!ts.proxy) {
      ts.proxy = MakeArrayProxy(ts.data, ts)
      let arr = ['last_price', 'average', 'highest', 'lowest', 'ask_price1', 'ask_volume1', 'bid_price1',
        'bid_volume1', 'volume', 'amount', 'open_interest', 'datetime']
      arr.forEach(key => {
        ts.data[key] = MakeArrayProxy(ts.data, ts, d => d ? d[key] : NaN)
      })
    }
    return ts.proxy
  }

  setDefault (default_value, ...path) {
    let node = typeof path[0] === 'object' ? path[0] : this._data
    for (let i = 0; i < path.length; i++) {
      if (typeof path[i] === 'string' || typeof path[i] === 'number') {
        if (!(path[i] in node)) {
          if (i + 1 === path.length) {
            let default_value_obj = typeof default_value === 'string' ? GenPrototype(default_value) : default_value
            node[path[i]] = default_value_obj
          } else {
            node[path[i]] = {}
          }
        }
        node = node[path[i]]
      }
    }
    return node
  }

  _getByPath (_path) {
    let path = UnifyArrayStyle(_path)
    let d = this._data
    let i = 0
    for (; i < path.length; i++) {
      d = d[path[i]]
      if (d === undefined) break
    }
    return (i < path.length - 1) ? {} : d
  }

  mergeData (source, epochIncrease = true, deleteNullObj = true) {
    if (epochIncrease) this._epoch += 1
    let sourceArr = Array.isArray(source) ? source : [source]
    for (let i in sourceArr) {
      let item = sourceArr[i]
      // 过滤掉空对象
      if (! (item === null || IsEmptyObject(item))){
        MergeObject(this._data, item, this._epoch, deleteNullObj)
      }
    }
    if (epochIncrease && this._data._epoch === this._epoch) {
      this.fire('data', null)
    }
  }

  isChanging (_path, source) {
    let path = UnifyArrayStyle(_path)
    // _data 中，只能找到对象类型中记录的 _epoch
    let d = this._data
    for (let i = 0; i < path.length; i++) {
      d = d[path[i]]
      if (d === undefined) return false
    }
    if (typeof d === 'object') {
      return d._epoch && d._epoch === this._epoch ? true : false
    }
    if (source) {
      // 在 source 中找，找到能找到的数据
      let d = source
      for (let i = 0; i < path.length; i++) {
        d = d[path[i]]
        if (d === undefined) return false
      }
      return true
    }
    return false
  }
}



export default DataManager
