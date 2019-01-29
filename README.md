
# TQSDK - JS

JavaScript 版本对天勤 DIFF 协议的封装。

[DIFF 协议 https://www.shinnytech.com/diff/ ](https://www.shinnytech.com/diff/)

## Install

Html 文件添加

```html
<script src="lib/tqsdk-x.x.x.js"></script>
```

JavaScript 文件中可以使用

```js
var tqsdk = new TQSDK();
```

## API

### 初始化

```js
var tqsdk = new TQSDK({

})
```

### on

```js
tqsdk.on('eventName', fn)
```

支持的事件：

+ ready: 收到合约基础数据（全局只出发一次）
+ rtn_brokers: 收到期货公司列表
+ notify: 收到通知对象
+ rtn_data: 数据更新（每一次数据更新触发）
+ error: 发生错误(目前只有一种：合约服务下载失败)


### update_data

```js
tqsdk.update_data(dataObject) 
```

手动更新数据集内容，支持自定义数据集

### subscribe_quote 订阅合约

```js
tqsdk.subscribe_quote([string|array]) 
```

### set_chart 订阅图表

```js
tqsdk.set_chart([object]) 
```

### insert_order 下单

### auto_insert_order 自动平昨平今

### cancel_order 撤单

### login 登录

### confirm_settlement 确认结算单

### transfer 银期转帐


### get_by_path 
### get_quote
### get_account_id
### get_positions
### get_position
### get_orders
### get_order
### get_accounts
### get_account
### get_trading_day

