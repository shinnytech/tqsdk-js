
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.1/axios.min.js"></script>
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

#### TQSDK~Tqsdk
**Kind**: inner class of TQSDK  
**Emits**: ready, rtn_data, rtn_brokers, notify, error  

* [~Tqsdk](#markdown-header-tqsdktqsdk)
    * [new Tqsdk([opts], [wsOption])](#markdown-header-new-tqsdkopts-wsoption)
    * [.initMdWebsocket()](#markdown-header-tqsdkinitmdwebsocket)
    * [.initTdWebsocket()](#markdown-header-tqsdkinittdwebsocket)
    * [.addWebSocket(url)](#markdown-header-tqsdkaddwebsocketurl)
    * [.getByPath(pathArray)](#markdown-header-tqsdkgetbypathpatharray)
    * [.getQuotesByInput(_input)](#markdown-header-tqsdkgetquotesbyinput_input)
    * [.getQuote(symbol)](#markdown-header-tqsdkgetquotesymbol-object) ⇒ object
    * [.setChart(payload)](#markdown-header-tqsdksetchartpayload)
    * [.get(param0)](#markdown-header-tqsdkgetparam0)
    * [.getKlines(symbol, dur)](#markdown-header-tqsdkgetklinessymbol-dur)
    * [.getTicks(symbol)](#markdown-header-tqsdkgettickssymbol)
    * [.isLogined(payload)](#markdown-header-tqsdkisloginedpayload-boolean) ⇒ boolean
    * [.isChanging(target, source)](#markdown-header-tqsdkischangingtarget-source)
    * [.subscribeQuote(payload)](#markdown-header-tqsdksubscribequotepayload)
    * [.addAccount(payload)](#markdown-header-tqsdkaddaccountpayload-object) ⇒ object
    * [.removeAccount(payload)](#markdown-header-tqsdkremoveaccountpayload)
    * [.refreshAccount(payload)](#markdown-header-tqsdkrefreshaccountpayload)
    * [.refreshAccounts()](#markdown-header-tqsdkrefreshaccounts)
    * [.insertOrder(payload)](#markdown-header-tqsdkinsertorderpayload-object) ⇒ object
    * [.autoInsertOrder(payload)](#markdown-header-tqsdkautoinsertorderpayload-list) ⇒ list
    * [.cancelOrder(payload)](#markdown-header-tqsdkcancelorderpayload)
    * [.getAccount(payload)](#markdown-header-tqsdkgetaccountpayload-objectnull) ⇒ object ⎮ null
    * [.getPosition(payload)](#markdown-header-tqsdkgetpositionpayload-objectnull) ⇒ object ⎮ null
    * [.getPositions(payload)](#markdown-header-tqsdkgetpositionspayload-objectnull) ⇒ object ⎮ null
    * [.getOrder(payload)](#markdown-header-tqsdkgetorderpayload-objectnull) ⇒ object ⎮ null
    * [.getOrders(payload)](#markdown-header-tqsdkgetorderspayload-objectnull) ⇒ object ⎮ null
    * [.getOrdersBySymbol(payload)](#markdown-header-tqsdkgetordersbysymbolpayload-objectnull) ⇒ object ⎮ null
    * [.getTrade(payload)](#markdown-header-tqsdkgettradepayload-objectnull) ⇒ object ⎮ null
    * [.getTrades(payload)](#markdown-header-tqsdkgettradespayload-objectnull) ⇒ object ⎮ null
    * [.getTradesByOrder(payload)](#markdown-header-tqsdkgettradesbyorderpayload-objectnull) ⇒ object ⎮ null
    * [.getTradesBySymbol(payload)](#markdown-header-tqsdkgettradesbysymbolpayload-objectnull) ⇒ object ⎮ null
    * [.login(payload)](#markdown-header-tqsdkloginpayload)
    * [.confirmSettlement(payload)](#markdown-header-tqsdkconfirmsettlementpayload)
    * [.transfer(payload)](#markdown-header-tqsdktransferpayload)
    * [.hisSettlement(payload)](#markdown-header-tqsdkhissettlementpayload)


* * *

##### new Tqsdk([opts], [wsOption])

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [opts] | object | `{}` | 描述 TQSDK 构造参数 |
| [opts.symbolsServerUrl] | string | `"https://openmd.shinnytech.com/t/md/symbols/latest.json"` | 合约服务地址 |
| [opts.wsQuoteUrl] | string | `"wss://openmd.shinnytech.com/t/md/front/mobile"` | 行情连接地址 |
| [opts.autoInit] | boolean | `true` | TQSDK 初始化后立即开始行情连接 |
| [opts.data] | object | `{}` | 存储数据对象 |
| [wsOption] | object | `{}` | 描述 TQSDK 构造参数 |
| [wsOption.reconnectInterval] | number | `3000` | websocket 自动重连时间间隔 |
| [wsOption.reconnectMaxTimes] | number | `2` | websocket 自动重连最大次数 |
| [wsOption.WebSocket] | object | `WebSocket` | 浏览器 WebSocket 对象，在 nodejs 运行时，需要传入 WebSocket |

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

##### tqsdk.initMdWebsocket()
初始化行情链接

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  
**Emits**: ready  
**Example**  
```js
const tqsdk = new TQSDK({autoInit: false})
tqsdk.initMdWebsocket()
tqsdk.on('ready', function(){
  console.log(tqsdk.getQuote('DCE.m2009'))
})
```

* * *

##### tqsdk.initTdWebsocket()
初始化交易链接

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  
**Emits**: rtn_brokers  
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

##### tqsdk.addWebSocket(url)
添加 websocket 数据源

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| url | string | 


* * *

##### tqsdk.getByPath(pathArray)
获取数据对象

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| pathArray | list | 


* * *

##### tqsdk.getQuotesByInput(_input)
根据输入字符串查询合约列表

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| _input | string | 


* * *

##### tqsdk.getQuote(symbol) ⇒ object
根据合约代码获取合约对象

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| symbol | string | 合约代码 |


* * *

##### tqsdk.setChart(payload)
请求 K 线图表

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| payload | object | 


* * *

##### tqsdk.get(param0)
根据传入对象查询数据

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| param0 | * | 


* * *

##### tqsdk.getKlines(symbol, dur)
获取 K 线序列

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| symbol | string | 
| dur | number | 


* * *

##### tqsdk.getTicks(symbol)
获取 Ticks 序列

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| symbol | string | 


* * *

##### tqsdk.isLogined(payload) ⇒ boolean
判断账户是否登录 [x]

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| payload | object | 
| payload.bid | string | 
| payload.user_id | string | 


* * *

##### tqsdk.isChanging(target, source)
判断某个对象是否最近一次有变动

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| target |  | 
| source | * | 

**Example**  
```js
let tqsdk = new TQSDK()
tqsdk.isChanging
```

* * *

##### tqsdk.subscribeQuote(payload)
订阅合约

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| payload | object | 


* * *

##### tqsdk.addAccount(payload) ⇒ object
添加期货账户

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  
**Returns**: object - account {bid, user_id, password, ws, dm}  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |
| payload.password | string | 密码 |

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

##### tqsdk.removeAccount(payload)
删除期货账户

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |


* * *

##### tqsdk.refreshAccount(payload)
刷新账户信息

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |


* * *

##### tqsdk.refreshAccounts()
刷新全部账户信息

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

* * *

##### tqsdk.insertOrder(payload) ⇒ object
下单

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  
**Returns**: object - order={order_id, status, ...}  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| payload | object |  |  |
| payload.bid | string |  | 期货公司 |
| payload.user_id | string |  | 账户名 |
| payload.exchange_id | string |  | 交易所 |
| payload.instrument_id | string |  | 合约名称 |
| payload.direction | string |  | 方向 [`BUY` | `SELL`] |
| payload.offset | string |  | 开平 [`OPEN` | `CLOSE` | `CLOSETODAY`] |
| payload.price_type | string | `"LIMIT"` | 限价 [`LIMIT` | `ANY`] |
| payload.limit_price | number |  | 价格 |
| payload.volume | number |  | 手数 |

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

##### tqsdk.autoInsertOrder(payload) ⇒ list
下单，但是平仓单会自动先平今再平昨，不需要用户区分 CLOSE | CLOSETODAY

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  
**Returns**: list - list=[{order_id, status, ...}, ...] 返回委托单数组，可能拆分为多个单  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| payload | object |  |  |
| payload.bid | string |  | 期货公司 |
| payload.user_id | string |  | 账户名 |
| payload.exchange_id | string |  | 交易所 |
| payload.instrument_id | string |  | 合约名称 |
| payload.direction | string |  | 方向 [`BUY` | `SELL`] |
| payload.offset | string |  | 开平 [`OPEN` | `CLOSE`] |
| payload.price_type | string | `"LIMIT"` | 限价 [`LIMIT` | `ANY`] |
| payload.limit_price | number |  | 价格 |
| payload.volume | number |  | 手数 |


* * *

##### tqsdk.cancelOrder(payload)
撤销委托单

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |
| payload.order_id | string | 委托单 id |


* * *

##### tqsdk.getAccount(payload) ⇒ object ⎮ null
获取账户资金信息

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type |
| --- | --- |
| payload | object | 
| payload.bid | string | 
| payload.user_id | string | 

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

##### tqsdk.getPosition(payload) ⇒ object ⎮ null
获取账户某个合约的持仓信息

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string |  |
| payload.user_id | string |  |
| payload.symbol | string | 合约名称 |

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

##### tqsdk.getPositions(payload) ⇒ object ⎮ null
获取账户全部持仓信息

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |

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

##### tqsdk.getOrder(payload) ⇒ object ⎮ null
获取账户某个合约的委托单信息

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string |  |
| payload.user_id | string |  |
| payload.order_id | string | 委托单 id |


* * *

##### tqsdk.getOrders(payload) ⇒ object ⎮ null
获取账户全部委托单信息

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |


* * *

##### tqsdk.getOrdersBySymbol(payload) ⇒ object ⎮ null
获取账户下某个合约对应的全部委托单信息

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |
| payload.symbol | string | 合约名称 |


* * *

##### tqsdk.getTrade(payload) ⇒ object ⎮ null
获取账户某个合约的成交记录

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string |  |
| payload.user_id | string |  |
| payload.trade_id | string | 成交记录 id |


* * *

##### tqsdk.getTrades(payload) ⇒ object ⎮ null
获取账户全部成交记录

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |


* * *

##### tqsdk.getTradesByOrder(payload) ⇒ object ⎮ null
获取账户下某个委托单对应的全部成交记录

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |
| payload.order_id | string | 委托单 id |


* * *

##### tqsdk.getTradesBySymbol(payload) ⇒ object ⎮ null
获取账户下某个合约对应的全部成交记录

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |
| payload.symbol | string | 合约名称 |


* * *

##### tqsdk.login(payload)
登录期货账户

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |
| payload.password | string | 密码 |


* * *

##### tqsdk.confirmSettlement(payload)
确认结算单

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |

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

##### tqsdk.transfer(payload)
银期转账

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| payload | object |  |  |
| payload.bid | string |  | 期货公司 |
| payload.user_id | string |  | 账户名 |
| payload.bank_id | string |  | 银行ID |
| payload.bank_password | string |  | 银行账户密码 |
| payload.future_account | string |  | 期货账户 |
| payload.future_password | string |  | 期货账户密码 |
| payload.currency | string | `"CNY"` | 币种代码 |
| payload.amount | string |  | 转账金额 >0 表示转入期货账户, <0 表示转出期货账户 |


* * *

##### tqsdk.hisSettlement(payload)
查询历史结算单

**Kind**: instance method of [Tqsdk](#markdown-header-new-tqsdkopts-wsoption)  

| Param | Type | Description |
| --- | --- | --- |
| payload | object |  |
| payload.bid | string | 期货公司 |
| payload.user_id | string | 账户名 |
| payload.trading_day | string | 交易日 |


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

&copy; 2017-2020 [Shinnytech](https://www.shinnytech.com/). Documented by [jsdoc-to-markdown](https://github.com/jsdoc2md/jsdoc-to-markdown).