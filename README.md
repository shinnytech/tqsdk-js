
# TQSDK - JS

天勤 DIFF 协议的封装（JavaScript 语言版本）。

DIFF 协议：[https://www.shinnytech.com/diff/](https://www.shinnytech.com/diff/)

## Install 

### 方案一

Html 文件添加

```html
<script src="lib/tqsdk-x.x.x.js"></script>
```

JavaScript 文件中可以直接使用：

```js
var tqsdk = new TQSDK();
```

### 方案二

采用 es6 开发，项目根目录下运行

```bash
npm install tqsdk
```

js 中引用

```js
import TQSDK from 'tqsdk'

let tqsdk = new TQSDK({})
```

## 如何使用

### 1. 初始化

```js
var tqsdk = new TQSDK({
  reconnectInterval, // websocket 最大重连时间间隔 默认 3000
  reconnectMaxTimes // websocket 最大重连次数 默认 5
})

// 全部使用默认参数
var tqsdk = new TQSDK()
```

### 2. on 事件监听 

```js
// 添加事件监听
tqsdk.on(eventName, cb)

// 取消事件监听
tqsdk.off(eventName, cb)
```

支持的事件：

|eventName|cb 回调函数参数|事件触发说明|
|---|---|---|
|ready | | 收到合约基础数据|
|rtn_brokers | (array) -- 期货公司列表 | 收到期货公司列表|
|notify | (object) -- 单个通知对象 | 收到通知对象|
|rtn_data | | 数据更新（每一次数据更新触发）|
|error | error | 发生错误(目前只有一种：合约服务下载失败)|

### 3. 操作

#### subscribe_quote 订阅合约

```js
tqsdk.subscribe_quote([string|array]) 
```

#### set_chart 订阅图表

```js
tqsdk.set_chart([object]) 
```

#### insert_order 下单

#### auto_insert_order 自动平昨平今

#### cancel_order 撤单

#### login 登录

#### confirm_settlement 确认结算单

#### transfer 银期转帐

### 4. 获取数据 api

#### get_account: ƒ get_account()

#### get_account_id: ƒ get_account_id()

#### get_accounts: ƒ get_accounts()

#### get_by_path: ƒ get_by_path(_path)

#### get_order: ƒ get_order(order_id)

#### get_orders: ƒ get_orders()

#### get_position: ƒ get_position(symbol)

#### get_positions: ƒ get_positions() 

#### get_quote: ƒ get_quote(symbol)

#### get_quotes_by_input: ƒ get_quotes_by_input(_input)

#### get_trades: ƒ get_trades()

#### get_trading_day: ƒ get_trading_day()

#### is_changed: ƒ is_changed(target, source)

#### is_logined: ƒ is_logined()

## 关于监听事件

监听 `rtn_data` 事件，可以实时对行情数据变化作出响应。但是需要在相应组件 destory 的时候取消监听对应事件。

### Vue Plugin

TQSDK - JS 封装为 Vue 插件，可以在组件中监听事件，不需要在单独取消监听。


```js
import Vue from 'vue'
import TQSDK from 'tqsdk'

let tqsdk = new TQSDK()

const NOOP = () => {}
let tqVmEventMap = {}
let tqsdkRE = /^tqsdk:/

function mixinEvents(Vue) {
  let on = Vue.prototype.$on
  let emit = Vue.prototype.$emit

  Vue.prototype.$on = function proxyOn(eventName, fn = NOOP) {
    const vm = this
    if (Array.isArray(eventName)) {
      eventName.forEach((item) => vm.$on(item, fn));
    } else if (tqsdkRE.test(eventName)) {
      if (!tqVmEventMap[vm._uid]) tqVmEventMap[vm._uid] = {}
      let tq_eventName = eventName.match(/^tqsdk:(.*)/)[1]
      if (!tqVmEventMap[vm._uid][tq_eventName]) tqVmEventMap[vm._uid][tq_eventName] = []
      tqVmEventMap[vm._uid][tq_eventName].push(fn)
      tqsdk.on(tq_eventName, fn.bind(vm))
    } else {
      on.call(vm, eventName, fn)
    }
    return vm
  }
}

function applyMixin(Vue) {
  Vue.mixin({
    beforeDestroy() {
      const vm = this
      const tqevents = tqVmEventMap[vm._uid] || {};
      for (let eventName in tqevents) {
        let eventsArr = tqevents[eventName]
        eventsArr.forEach((fn) => {
          tqsdk.removeEventListener(eventName, fn)
        })
      }
      delete tqVmEventMap[vm._uid];
    }
  })
}

function plugin(Vue) {
  if (VERSION < 2) {
    console.error('[vue-event-proxy] only support Vue 2.0+');
    return;
  }
  // Exit if the plugin has already been installed.
  if (plugin.installed) return
  plugin.installed = true
  mixinEvents(Vue)
  applyMixin(Vue)
}

Vue.use(plugin)

Vue.$tqsdk = tqsdk
Vue.prototype.$tqsdk = tqsdk

export default tqsdk;
```
