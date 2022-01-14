
# TQSDK - JS

天勤 [DIFF 协议 (https://www.shinnytech.com/diff/)](https://www.shinnytech.com/diff/) 的封装（JavaScript 语言版本）。

<p align="center">
    <a href="https://www.shinnytech.com/diff" target="_blank" rel="noopener noreferrer">
        <img width="100" src="./img/logo.png" alt="kuaiqi logo">
    </a>
</p>
<p align="center">
  <a href="http://standardjs.com">
    <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="js-standard-style">
  </a>
  <a href="https://www.npmjs.com/package/tqsdk">
    <img src="https://img.shields.io/npm/dw/tqsdk.svg" alt="Downloads">
  </a>
  <a href="https://www.npmjs.com/package/tqsdk">
    <img src="https://img.shields.io/npm/v/tqsdk.svg" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/tqsdk">
    <img src="https://img.shields.io/npm/l/tqsdk.svg" alt="License">
  </a>
</p>

`TQSDK-JS` 支持以下功能，详情参见 [API Reference](#api_reference)：

* [x] 查询合约行情。
* [x] 查询合约 K线图，Tick图，盘口报价。
* [x] 登录期货交易账户。
* [x] 查看账户资金、持仓记录、委托单记录。
* [x] 多账户查询。
* [x] 支持穿透视监管。
* [x] 查询历史结算单。

## 1. 安装


### 方案一

Html 文件添加

```html
<script src="dist/umd/tqsdk.min.js"></script>
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
let tqsdk = new TQSDK()
```

## 2. 使用

### 2.1 初始化

```js
// 建议全局只初始化一次，后面只使用实例 tqsdk
const tqsdk = new TQSDK()

// or 使用指定参数初始化
const tqsdk = new TQSDK({
  symbolsServerUrl: 'https://openmd.shinnytech.com/t/md/symbols/latest.json',
  wsQuoteUrl: 'wss://openmd.shinnytech.com/t/md/front/mobile',
  autoInit: true
})
```

### 2.2 on 事件监听

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
|rtn_brokers | [] 期货公司列表 | 收到期货公司列表|
|notify | {} 单个通知对象 | 收到通知对象|
|rtn_data | | 数据更新（每一次数据更新触发）|
|error | error | 发生错误(目前只有一种：合约服务下载失败)|

 :warning: 监听 `rtn_data` 事件，可以实时对行情数据变化作出响应。但是需要在相应组件 destory 的时候取消监听对应事件。

## 3. API Reference

<a name="exp_module_TQSDK--Tqsdk"></a>

#### Tqsdk ⇐ <code>EventEmitter</code> ⏏
**Kind**: Exported class  
**Extends**: <code>EventEmitter</code>  
**Emits**: [<code>ready</code>](#TQSDK+event_ready), [<code>rtn\_data</code>](#TQSDK+event_rtn_data), [<code>rtn\_brokers</code>](#TQSDK+event_rtn_brokers), [<code>notify</code>](#TQSDK+event_notify), [<code>error</code>](#TQSDK+event_error)  

* * *

<a name="new_module_TQSDK--Tqsdk_new"></a>

##### new Tqsdk([opts], [wsOption])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | <code>object</code> | <code>{}</code> | 描述 TQSDK 构造参数 |
| [opts.symbolsServerUrl] | <code>string</code> | <code>&quot;https://openmd.shinnytech.com/t/md/symbols/latest.json&quot;</code> | 合约服务地址 |
| [opts.wsQuoteUrl] | <code>string</code> | <code>&quot;wss://openmd.shinnytech.com/t/md/front/mobile&quot;</code> | 行情连接地址 |
| [opts.autoInit] | <code>boolean</code> | <code>true</code> | TQSDK 初始化后立即开始行情连接 |
| [opts.clientSystemInfo=] | <code>string</code> |  | 客户端信息 |
| [opts.clientAppId=] | <code>string</code> |  | 客户端信息 |
| [opts.data] | <code>object</code> | <code>{}</code> | 存储数据对象 |
| [wsOption] | <code>object</code> | <code>{}</code> | 描述 TQSDK 构造参数 |
| [wsOption.reconnectInterval] | <code>number</code> | <code>3000</code> | websocket 自动重连时间间隔 |
| [wsOption.reconnectMaxTimes] | <code>number</code> | <code>2</code> | websocket 自动重连最大次数 |
| [wsOption.WebSocket] | <code>object</code> | <code>WebSocket</code> | 浏览器 WebSocket 对象，在 nodejs 运行时，需要传入 WebSocket |

**Example**  
```js
// 浏览器
const tqsdk = new TQSDK()
tqsdk.on('ready', function () {
  console.log(tqsdk.getQuote('SHFE.au2006'))
})
tqsdk.on('rtn_brokers', function (brokers) {
  console.log(brokers)
})
```
**Example**  
```js
// nodejs
const TQSDK = require('./dist/umd/tqsdk-nocache')
const WebSocket = require('ws')
const tqsdk = new TQSDK({}, {WebSocket})
tqsdk.on('ready', function () {
  console.log(tqsdk.getQuote('SHFE.au2006'))
})
tqsdk.on('rtn_brokers', function (brokers) {
  console.log(brokers)
})
```
**Example**  
```js
// 1 autoInit 为 true，构造函数会执行 tqsdk.initMdWebsocket(), tqsdk.initTdWebsocket(), 代码中不需要再运行
// 推荐使用这种初始化方式
const tqsdk = new TQSDK({autoInit: true}) // 等价于 const tqsdk = new TQSDK()
tqsdk.on('ready', function(){
  console.log(tqsdk.getQuote('DCE.m2009'))
})

// 2 autoInit 为 false，构造函数不会去执行 tqsdk.initMdWebsocket(), tqsdk.initTdWebsocket()
// 在代码中需要的地方再执行
const tqsdk = new TQSDK({autoInit: false})
tqsdk.initMdWebsocket()
// 如果不运行 tqsdk.initMdWebsocket()， 则不会有 ready 事件发生
tqsdk.on('ready', function(){
  console.log(tqsdk.getQuote('DCE.m2009'))
})
```

* * *

<a name="module_TQSDK--Tqsdk+initMdWebsocket"></a>

##### tqsdk.initMdWebsocket()
初始化行情链接

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Emits**: [<code>ready</code>](#TQSDK+event_ready)  
**Example**  
```js
const tqsdk = new TQSDK({autoInit: false})
tqsdk.initMdWebsocket()
tqsdk.on('ready', function(){
  console.log(tqsdk.getQuote('DCE.m2009'))
})
```

* * *

<a name="module_TQSDK--Tqsdk+initTdWebsocket"></a>

##### tqsdk.initTdWebsocket()
初始化交易链接

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Emits**: [<code>rtn\_brokers</code>](#TQSDK+event_rtn_brokers)  
**Example**  
```js
const tqsdk = new TQSDK({autoInit: false})
tqsdk.initMdWebsocket()
tqsdk.initTdWebsocket()
tqsdk.on('rtn_brokers', function(brokers){
  console.log(brokers)
})
```

* * *

<a name="module_TQSDK--Tqsdk+get"></a>

##### tqsdk.get(payload) ⇒ <code>object</code> \| <code>null</code>
获取数据

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| payload | <code>object</code> |  |  |
| [payload.name] | <code>string</code> | <code>&quot;users&quot;</code> |  |
| [payload.bid] | <code>string</code> |  | 当 name in ['user', 'session', 'accounts', 'account', 'positions', 'position', 'orders', 'order', 'trades', 'trade'] |
| [payload.user_id] | <code>string</code> |  | 当 name in ['user', 'session', 'accounts', 'account', 'positions', 'position', 'orders', 'order', 'trades', 'trade'] |
| [payload.currency] | <code>string</code> |  | 当 name='account' |
| [payload.symbol] | <code>string</code> |  | 当 name in ['position', 'quote', 'ticks', 'klines'] |
| [payload.order_id] | <code>string</code> |  | 当 name='order' |
| [payload.trade_id] | <code>string</code> |  | 当 name='trade' |
| [payload.trading_day] | <code>string</code> |  | 当 name='his_settlement' |
| [payload.chart_id] | <code>string</code> |  | 当 name='chart' |
| [payload.input] | <code>string</code> |  | 当 name='quotes' |
| [payload.duration] | <code>string</code> |  | 当 name='klines' |


* * *

<a name="module_TQSDK--Tqsdk+getByPath"></a>

##### tqsdk.getByPath(pathArray, dm) ⇒ <code>object</code> \| <code>null</code>
获取数据对象

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| pathArray | <code>list</code> |  |
| dm | <code>object</code> | 获取对象数据源，默认为当前实例的 datamanager |

**Example**  
```js
// 获取某个合约下市时间
// 推荐使用这种方式，先获取 quote 对象的引用
let quote = tqdsk.getQuote('SHFE.au2006')
let dt = quote.expire_datetime

// 以上代码等价于
let dt = tqsdk.getByPath(['quotes', 'SHFE.au2006', 'expire_datetime'])
```

* * *

<a name="module_TQSDK--Tqsdk+getQuotesByInput"></a>

##### tqsdk.getQuotesByInput(input, filterOption) ⇒ <code>list</code>
根据输入字符串查询合约列表

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Returns**: <code>list</code> - [symbol, ...]  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| input | <code>string</code> |  |  |
| filterOption | <code>object</code> |  | 查询合约列表条件限制 |
| [filterOption.symbol] | <code>boolean</code> | <code>true</code> | 是否根据合约ID匹配 |
| [filterOption.pinyin] | <code>boolean</code> | <code>true</code> | 是否根据拼音匹配 |
| [filterOption.include_expired] | <code>boolean</code> | <code>false</code> | 匹配结果是否包含已下市合约 |
| [filterOption.future] | <code>boolean</code> | <code>true</code> | 匹配结果是否包含期货合约 |
| [filterOption.future_index] | <code>boolean</code> | <code>false</code> | 匹配结果是否包含期货指数 |
| [filterOption.future_cont] | <code>boolean</code> | <code>false</code> | 匹配结果是否包含期货主连 |
| [filterOption.option] | <code>boolean</code> | <code>false</code> | 匹配结果是否包含期权 |
| [filterOption.combine] | <code>boolean</code> | <code>false</code> | 匹配结果是否包含组合 |

**Example**  
```js
const tqsdk = new TQSDK()
const quote = tqsdk.getQuote('SHFE.au2006')
tqsdk.on('ready', function () {
  console.log(tqsdk.getQuotesByInput('huangjin'))
  console.log(tqsdk.getQuotesByInput('doupo', { future_index: true, future_cont: true }))
})
```

* * *

<a name="module_TQSDK--Tqsdk+getQuote"></a>

##### tqsdk.getQuote(symbol) ⇒ <code>Quote</code>
根据合约代码获取合约对象

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | <code>string</code> | 合约代码 |

**Example**  
```js
const tqsdk = new TQSDK()
const quote = tqsdk.getQuote('SHFE.au2006')
tqsdk.on('rtn_data', function () {
  console.log(quote.last_price, quote.pre_settlement)
})
```

* * *

<a name="module_TQSDK--Tqsdk+setChart"></a>

##### tqsdk.setChart(payload) ⇒ <code>object</code>
请求 K 线图表

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Returns**: <code>object</code> - chart  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| payload.chart_id | <code>string</code> | 图表 id |
| payload.symbol | <code>string</code> | 合约代码 |
| payload.duration | <code>number</code> | 图表周期，0 表示 tick, 1e9 表示 1s, UnixNano 时间 |
| [payload.view_width] | <code>number</code> | 图表柱子宽度 |
| [payload.left_kline_id] | <code>number</code> | 指定一个K线id，向右请求view_width个数据 |
| [payload.trading_day_start] | <code>number</code> | 指定交易日，返回对应的数据 |
| [payload.trading_day_count] | <code>number</code> | 请求交易日天数 |
| [payload.focus_datetime] | <code>number</code> | 使得指定日期的K线位于屏幕第M个柱子的位置 |
| [payload.focus_position] | <code>number</code> | 使得指定日期的K线位于屏幕第M个柱子的位置 |

**Example**  
```js
let tqsdk = new TQSDK()
let chart = tqsdk.setChart({symbol: 'SHFE.au2006', duration: 60 * 1e9, view_width: 100})
tqsdk.on('rtn_data', function(){
  console.log('chart.right_id', chart && chart.right_id)
})
```

* * *

<a name="module_TQSDK--Tqsdk+getChart"></a>

##### tqsdk.getChart(chart_id) ⇒ <code>object</code>
获取 chart 对象

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Returns**: <code>object</code> - {}  

| Param | Type |
| --- | --- |
| chart_id | <code>string</code> | 


* * *

<a name="module_TQSDK--Tqsdk+getKlines"></a>

##### tqsdk.getKlines(symbol, dur) ⇒ <code>object</code>
获取 K 线序列

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Returns**: <code>object</code> - {data, last_id}  

| Param | Type |
| --- | --- |
| symbol | <code>string</code> | 
| dur | <code>number</code> | 


* * *

<a name="module_TQSDK--Tqsdk+getTicks"></a>

##### tqsdk.getTicks(symbol) ⇒ <code>object</code>
获取 Ticks 序列

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Returns**: <code>object</code> - {data, last_id}  

| Param | Type |
| --- | --- |
| symbol | <code>string</code> | 


* * *

<a name="module_TQSDK--Tqsdk+isChanging"></a>

##### tqsdk.isChanging(target|pathArray) ⇒ <code>boolean</code>
判断某个对象是否最近一次有变动

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| target|pathArray | <code>object</code> \| <code>list</code> | 检查变动的对象或者路径数组 |

**Example**  
```js
let tqsdk = new TQSDK()
let quote = tqsdk.getQuote('DCE.m2006')
let quote1 = tqsdk.getQuote('DCE.cs2006')
tqsdk.on('rtn_data', function(){
  if (tqsdk.isChanging(quote)) {
    console.log('DCE.m2006 updated', quote.datetime, quote.last_price, quote.volume)
  }
  if (tqsdk.isChanging(['quotes', 'DCE.cs2006'])) {
    console.log('DCE.cs2006 updated', quote1.datetime, quote1.last_price, quote1.volume)
  }
})
```

* * *

<a name="module_TQSDK--Tqsdk+subscribeQuote"></a>

##### tqsdk.subscribeQuote(quotes)
订阅合约, 手动订阅合约

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Default |
| --- | --- | --- |
| quotes | <code>list</code> \| <code>string</code> | <code>[</code> | 

**Example**  
```js
let tqsdk = new TQSDK()
tqsdk.subscribeQuote('SHFE.au2006')
tqsdk.subscribeQuote(['SHFE.au2006', 'DCE.m2008'])
```

* * *

<a name="module_TQSDK--Tqsdk+addAccount"></a>

##### tqsdk.addAccount(payload) ⇒ <code>object</code>
添加期货账户

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Returns**: <code>object</code> - account {bid, user_id, password, ws, dm}  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| payload.bid | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |
| payload.password | <code>string</code> | 密码 |

**Example**  
```js
const tqsdk = new TQSDK()
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
tqsdk.on('rtn_brokers', function(brokers){
  tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
  tqsdk.login(account) // 发送登录期货账户的请求
})
tqsdk.on('rtn_data', function(){
  console.log(tqsdk.isLogined(account))
})
```

* * *

<a name="module_TQSDK--Tqsdk+removeAccount"></a>

##### tqsdk.removeAccount(payload)
删除期货账户

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |


* * *

<a name="module_TQSDK--Tqsdk+login"></a>

##### tqsdk.login(payload)
登录期货账户

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| payload.bid | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |
| payload.password | <code>string</code> | 密码 |

**Example**  
```js
const tqsdk = new TQSDK()
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
tqsdk.on('rtn_brokers', function(brokers){
  tqsdk.login(account) // 发送登录期货账户的请求
})
tqsdk.on('rtn_data', function(){
  console.log(tqsdk.isLogined(account))
})
```

* * *

<a name="module_TQSDK--Tqsdk+isLogined"></a>

##### tqsdk.isLogined(payload) ⇒ <code>boolean</code>
判断账户是否登录 [x]

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type |
| --- | --- |
| payload | <code>object</code> | 
| [payload.bid] | <code>string</code> | 
| payload.user_id | <code>string</code> | 


* * *

<a name="module_TQSDK--Tqsdk+refreshAccount"></a>

##### tqsdk.refreshAccount(payload)
刷新账户信息，用于账户资金没有同步正确

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |


* * *

<a name="module_TQSDK--Tqsdk+refreshAccounts"></a>

##### tqsdk.refreshAccounts()
刷新全部账户信息，用于账户资金没有同步正确

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

* * *

<a name="module_TQSDK--Tqsdk+getAllAccounts"></a>

##### tqsdk.getAllAccounts() ⇒ <code>list</code>
获取全部账户信息

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Example**  
```js
const tqsdk = new TQSDK()
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
const account1 = { bid: '快期模拟', user_id: 'test1234', password: '123456' }
tqsdk.on('rtn_brokers', function(brokers){
  tqsdk.login(account) // 发送登录期货账户的请求
  tqsdk.login(account1) // 发送登录期货账户的请求
  // ........
  const accounts = tqsdk.getAllAccounts()
  console.log(accounts)
})
```

* * *

<a name="module_TQSDK--Tqsdk+getAccount"></a>

##### tqsdk.getAccount(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户资金信息

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type |
| --- | --- |
| payload | <code>object</code> | 
| [payload.bid] | <code>string</code> | 
| payload.user_id | <code>string</code> | 

**Example**  
```js
const tqsdk = new TQSDK()
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
tqsdk.on('rtn_brokers', function(brokers){
  tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
  tqsdk.login(account) // 发送登录期货账户的请求
})
tqsdk.on('rtn_data', function(){
  if (tqsdk.isLogined(account)) {
    let account = tqsdk.getAccount(account)
    console.log(account.balance, account.risk_ratio)
  }
})
```

* * *

<a name="module_TQSDK--Tqsdk+insertOrder"></a>

##### tqsdk.insertOrder(payload) ⇒ <code>object</code>
下单

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Returns**: <code>object</code> - order={order_id, status, ...}  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| payload | <code>object</code> |  |  |
| [payload.bid] | <code>string</code> |  | 期货公司 |
| payload.user_id | <code>string</code> |  | 账户名 |
| payload.exchange_id | <code>string</code> |  | 交易所 |
| payload.instrument_id | <code>string</code> |  | 合约名称 |
| payload.direction | <code>string</code> |  | 方向 [`BUY` | `SELL`] |
| payload.offset | <code>string</code> |  | 开平 [`OPEN` | `CLOSE` | `CLOSETODAY`] |
| payload.price_type | <code>string</code> | <code>&quot;LIMIT&quot;</code> | 限价 [`LIMIT` | `ANY`] |
| payload.limit_price | <code>number</code> |  | 价格 |
| payload.volume | <code>number</code> |  | 手数 |

**Example**  
```js
let tqsdk = new TQSDK()
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
tqsdk.on('rtn_brokers', function(brokers){
  tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
  tqsdk.login(account) // 发送登录期货账户的请求
})
tqsdk.on('rtn_data', function(){
  if (!tqsdk.isLogined(account)) return
  let order = tqsdk.insertOrder(Object.assign({
      exchange_id: 'SHFE',
      instrument_id: 'au2006',
      direction: 'BUY',
      offset: 'OPEN',
      price_type: 'LIMIT',
      limit_price: 359.62,
      volume: 2
  }, account))
  console.log(order.orderId, order.status, order.volume_left)
})
```

* * *

<a name="module_TQSDK--Tqsdk+autoInsertOrder"></a>

##### tqsdk.autoInsertOrder(payload) ⇒ <code>list</code>
下单，但是平仓单会自动先平今再平昨，不需要用户区分 CLOSE | CLOSETODAY

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  
**Returns**: <code>list</code> - list=[{order_id, status, ...}, ...] 返回委托单数组，可能拆分为多个单  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| payload | <code>object</code> |  |  |
| [payload.bid] | <code>string</code> |  | 期货公司 |
| payload.user_id | <code>string</code> |  | 账户名 |
| payload.exchange_id | <code>string</code> |  | 交易所 |
| payload.instrument_id | <code>string</code> |  | 合约名称 |
| payload.direction | <code>string</code> |  | 方向 [`BUY` | `SELL`] |
| payload.offset | <code>string</code> |  | 开平 [`OPEN` | `CLOSE`] |
| payload.price_type | <code>string</code> | <code>&quot;LIMIT&quot;</code> | 限价 [`LIMIT` | `ANY`] |
| payload.limit_price | <code>number</code> |  | 价格 |
| payload.volume | <code>number</code> |  | 手数 |


* * *

<a name="module_TQSDK--Tqsdk+cancelOrder"></a>

##### tqsdk.cancelOrder(payload)
撤销委托单

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |
| payload.order_id | <code>string</code> | 委托单 id |


* * *

<a name="module_TQSDK--Tqsdk+getPosition"></a>

##### tqsdk.getPosition(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户某个合约的持仓信息

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> |  |
| payload.user_id | <code>string</code> |  |
| payload.symbol | <code>string</code> | 合约名称 |

**Example**  
```js
const tqsdk = new TQSDK()
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
tqsdk.on('rtn_brokers', function(brokers){
  tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
  tqsdk.login(account) // 发送登录期货账户的请求
})
tqsdk.on('rtn_data', function(){
  if (tqsdk.isLogined(account)) {
    let pos = tqsdk.getPosition(Object.assign({ symbol: 'SHFE.au2006' }, account))
    console.log(pos)
  }
})
```

* * *

<a name="module_TQSDK--Tqsdk+getPositions"></a>

##### tqsdk.getPositions(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户全部持仓信息

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |

**Example**  
```js
const tqsdk = new TQSDK()
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
tqsdk.on('rtn_brokers', function(brokers){
  tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
  tqsdk.login(account) // 发送登录期货账户的请求
})
tqsdk.on('rtn_data', function(){
  if (tqsdk.isLogined(account)) {
    let pos = tqsdk.getPositions(account)
    console.log(pos)
  }
})
```

* * *

<a name="module_TQSDK--Tqsdk+getOrder"></a>

##### tqsdk.getOrder(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户某个合约的委托单信息

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> |  |
| payload.user_id | <code>string</code> |  |
| payload.order_id | <code>string</code> | 委托单 id |


* * *

<a name="module_TQSDK--Tqsdk+getOrders"></a>

##### tqsdk.getOrders(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户全部委托单信息

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |


* * *

<a name="module_TQSDK--Tqsdk+getOrdersBySymbol"></a>

##### tqsdk.getOrdersBySymbol(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户下某个合约对应的全部委托单信息

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |
| payload.symbol | <code>string</code> | 合约名称 |


* * *

<a name="module_TQSDK--Tqsdk+getTrade"></a>

##### tqsdk.getTrade(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户某个合约的成交记录

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> |  |
| payload.user_id | <code>string</code> |  |
| payload.trade_id | <code>string</code> | 成交记录 id |


* * *

<a name="module_TQSDK--Tqsdk+getTrades"></a>

##### tqsdk.getTrades(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户全部成交记录

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |


* * *

<a name="module_TQSDK--Tqsdk+getTradesByOrder"></a>

##### tqsdk.getTradesByOrder(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户下某个委托单对应的全部成交记录

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |
| payload.order_id | <code>string</code> | 委托单 id |


* * *

<a name="module_TQSDK--Tqsdk+getTradesBySymbol"></a>

##### tqsdk.getTradesBySymbol(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户下某个合约对应的全部成交记录

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |
| payload.symbol | <code>string</code> | 合约名称 |


* * *

<a name="module_TQSDK--Tqsdk+getHisSettlements"></a>

##### tqsdk.getHisSettlements(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户的历史结算单

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |


* * *

<a name="module_TQSDK--Tqsdk+getHisSettlement"></a>

##### tqsdk.getHisSettlement(payload) ⇒ <code>object</code> \| <code>null</code>
获取账户某一日历史结算单

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |
| payload.trading_day | <code>string</code> | 查询日期 |


* * *

<a name="module_TQSDK--Tqsdk+confirmSettlement"></a>

##### tqsdk.confirmSettlement(payload)
确认结算单， 每个交易日需要确认一次

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |

**Example**  
```js
const tqsdk = new TQSDK()
const account = { bid: '快期模拟', user_id: 'test123', password: '123456' }
tqsdk.on('rtn_brokers', function(brokers){
  tqsdk.addAccount(account) // 仅添加期货账户信息并建立链接，不会登录账户
  tqsdk.login(account) // 发送登录期货账户的请求
})
tqsdk.on('rtn_data', function(){
  if (tqsdk.isLogined(account)) {
    tqsdk.confirmSettlement(account) // 每个交易日都需要在确认结算单后才可以下单
    // tqsdk.insertOrder({....})
  }
})
```

* * *

<a name="module_TQSDK--Tqsdk+transfer"></a>

##### tqsdk.transfer(payload)
银期转账

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| payload | <code>object</code> |  |  |
| [payload.bid] | <code>string</code> |  | 期货公司 |
| payload.user_id | <code>string</code> |  | 账户名 |
| payload.bank_id | <code>string</code> |  | 银行ID |
| payload.bank_password | <code>string</code> |  | 银行账户密码 |
| payload.future_account | <code>string</code> |  | 期货账户 |
| payload.future_password | <code>string</code> |  | 期货账户密码 |
| payload.currency | <code>string</code> | <code>&quot;CNY&quot;</code> | 币种代码 |
| payload.amount | <code>string</code> |  | 转账金额 >0 表示转入期货账户, <0 表示转出期货账户 |


* * *

<a name="module_TQSDK--Tqsdk+hisSettlement"></a>

##### tqsdk.hisSettlement(payload)
查询历史结算单

**Kind**: instance method of [<code>Tqsdk</code>](#exp_module_TQSDK--Tqsdk)  

| Param | Type | Description |
| --- | --- | --- |
| payload | <code>object</code> |  |
| [payload.bid] | <code>string</code> | 期货公司 |
| payload.user_id | <code>string</code> | 账户名 |
| payload.trading_day | <code>string</code> | 交易日 |


* * *



## Vue Plugin

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

&copy; 2017-2022 [Shinnytech](https://www.shinnytech.com/). Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).
