/* eslint-disable vue/no-parsing-error */

class QUOTE {
  constructor() {
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

  set last_price(p) {
    this._last_price = p
    this.setChange()
  }

  get last_price() {
    return this._last_price
  }

  set pre_settlement(p) {
    this._pre_settlement = p
    this.setChange()
  }

  get pre_settlement() {
    return this._pre_settlement
  }

  setChange() {
    if (Number.isFinite(this._last_price) && Number.isFinite(this._pre_settlement) && this._pre_settlement != 0) {
      this.change = this._last_price - this._pre_settlement
      this.change_percent = this.change / this._pre_settlement * 100
    }
  }
}

class KLINE {
  constructor() {
    this.datetime = 0; // 1501080715000000000 (K线起点时间(按北京时间)，自unix epoch(1970-01-01 00:00:00 GMT)以来的纳秒数)
    this.open = NaN; // K线起始时刻的最新价
    this.close = NaN; // K线结束时刻的最新价
    this.high = NaN; // K线时间范围内的最高价
    this.low = NaN; // K线时间范围内的最低价
    this.open_oi = 0; // K线起始时刻的持仓量
    this.close_oi = 0; // K线结束时刻的持仓量
    this.volume = 0; //K线时间范围内的成交量
  }
}

class TICK {
  constructor() {
    this.datetime = 0; // 1501074872000000000 (tick从交易所发出的时间(按北京时间)，自unix epoch(1970-01-01 00:00:00 GMT)以来的纳秒数)
    this.last_price = NaN; // 最新价
    this.average = NaN; // 当日均价
    this.highest = NaN; // 当日最高价
    this.lowest = NaN; // 当日最低价
    this.ask_price1 = NaN; // 卖一价
    this.ask_volume1 = 0; // 卖一量
    this.bid_price1 = NaN; // 买一价
    this.bid_volume1 = 0; // 买一量
    this.volume = 0; // 当日成交量
    this.amount = NaN; // 成交额
    this.open_interest = NaN; // 持仓量
  }
}

class TRADE {
  constructor() {
    this.user_id = '';
    this.order_id = ''; // 委托单ID, 对于一个用户的所有委托单，这个ID都是不重复的
    this.trade_id = ''; // 成交ID, 对于一个用户的所有成交，这个ID都是不重复的
    this.exchange_id = ''; // 'SHFE' 交易所
    this.instrument_id = ''; // 'rb1901' 交易所内的合约代码
    this.exchange_trade_id = ''; // 交易所成交单号
    this.direction = ''; // 下单方向 (BUY=买, SELL=卖)
    this.offset = ''; // 开平标志 (OPEN=开仓, CLOSE=平仓, CLOSETODAY=平今)
    this.volume = 0; // 成交手数
    this.price = 0; // 成交价格
    this.trade_date_time = 0; // 成交时间, epoch nano
    this.commission = 0; // 成交手续费
    this.seqno = 0;
  }
}

class ORDER {
  constructor() {
    // order_id, 用于唯一标识一个委托单. 对于一个USER, order_id 是永远不重复的
    // 委托单初始属性 (由下单者在下单前确定, 不再改变)
    this.user_id = ''; // 用户ID
    this.order_id = ''; // 委托单ID, 对于一个USER, order_id 是永远不重复的
    this.exchange_id = ''; // 交易所
    this.instrument_id = ''; // 在交易所中的合约代码
    this.direction = ''; // 下单方向 (BUY=买, SELL=卖)
    this.offset = ''; // 开平标志 (OPEN=开仓, CLOSE=平仓, CLOSETODAY=平今)
    this.volume_orign = 0; // 总报单手数
    this.price_type = ''; // 指令类型 (ANY=市价, LIMIT=限价)
    this.limit_price = 0; // 委托价格, 仅当 price_type = LIMIT 时有效
    this.time_condition = ''; // 时间条件 (IOC=立即完成，否则撤销, GFS=本节有效, *GFD=当日有效, GTC=撤销前有效, GFA=集合竞价有效)
    this.volume_condition = ''; // 数量条件 (ANY=任何数量, MIN=最小数量, ALL=全部数量)
    this.//  =单后获得的信息;由期货公司返回, 不会改变)
      this.insert_date_time = 0; // 1501074872000000000 下单时间(按北京时间)，自unix epoch(1970-01-01 00:00:00 GMT)以来的纳秒数
    this.exchange_order_id = ''; // 交易所单号
    this.//  =托单当前状态;this.status = ''; // 委托单状态, (ALIVE=有效, FINISHED=已完)
      this.volume_left = 0; // 未成交手数
    this.frozen_margin = 0; // 冻结保证金
    this.last_msg = ''; // "报单成功" 委托单状态信息
    this.seqno = 0; // 部序号
  }
}

class POSITION {
  constructor() {
    // 交易所和合约代码
    this.user_id = ''; // 用户ID
    this.exchange_id = ''; // 'SHFE' 交易所
    this.instrument_id = ''; // 'rb1901' 交易所内的合约代码
    // 持仓手数与冻结手数
    this.volume_long_today = 0; // 多头今仓持仓手数
    this.volume_long_his = 0; // 多头老仓持仓手数
    this.volume_long = 0; // 多头持仓手数
    this.volume_long_frozen_today = 0; // 多头今仓冻结手数
    this.volume_long_frozen_his = 0; // 多头老仓冻结手数
    this.volume_long_frozen = 0; // 多头持仓冻结

    this.volume_short_today = 0; // 空头今仓持仓手数
    this.volume_short_his = 0; // 空头老仓持仓手数
    this.volume_short = 0; // 空头持仓手数
    this.volume_short_frozen_today = 0; // 空头今仓冻结手数
    this.volume_short_frozen_his = 0; // 空头老仓冻结手数
    this.volume_short_frozen = 0; // 空头持仓冻结

    // 成本, 现价与盈亏
    this.open_price_long = 0; // 多头开仓均价
    this.open_price_short = 0; // 空头开仓均价
    this.open_cost_long = 0; // 多头开仓市值
    this.open_cost_short = 0; // 空头开仓市值
    this.position_price_long = 0; // 多头持仓均价
    this.position_price_short = 0; // 空头持仓均价
    this.position_cost_long = 0; // 多头持仓市值
    this.position_cost_short = 0; // 空头持仓市值
    this.last_price = 0; // 最新价
    this.float_profit_long = 0; // 多头浮动盈亏
    this.float_profit_short = 0; // 空头浮动盈亏
    this.float_profit = 0; // 浮动盈亏 = float_profit_long + float_profit_short
    this.position_profit_long = 0; // 多头持仓盈亏
    this.position_profit_short = 0; // 空头持仓盈亏
    this.position_profit = 0; // 持仓盈亏 = position_profit_long + position_profit_short
    // 保证金占用
    this.margin_long = 0; // 多头持仓占用保证金
    this.margin_short = 0; // 空头持仓占用保证金
    this.margin = 0; // 持仓占用保证金 = margin_long + margin_short
  }
}

class BANK {
  constructor() {
    this.id = '';
    this.name = '';
  }
}

class ACCOUNT {
  constructor() {
    this.currency = ''; // "CNY" (币种)
    this.balance = NaN; // 账户权益
    this.available = NaN; // 可用资金
    this.pre_balance = NaN; // 昨日账户权益
    this.deposit = NaN; // 入金金额 本交易日内的入金金额
    this.withdraw = NaN; // 出金金额 本交易日内的出金金额
    this.commission = NaN; // 手续费 本交易日内交纳的手续费
    this.premium = NaN; // 权利金 本交易日内交纳的权利金
    this.static_balance = NaN; // 静态权益
    this.position_profit = NaN; // 持仓盈亏
    this.float_profit = NaN; // 浮动盈亏
    this.risk_ratio = NaN; // 风险度
    this.margin = NaN; // 保证金占用
    this.frozen_margin = NaN; // 冻结保证金
    this.frozen_commission = NaN; // 冻结手续费
    this.frozen_premium = NaN; // 冻结权利金
    this.close_profit = NaN; // 本交易日内平仓盈亏
  }
}

const DataStructure = {
  QUOTE,
  KLINE,
  TICK,
  TRADE,
  ORDER,
  POSITION,
  BANK,
  ACCOUNT
}

let GenPrototype = (k) => new DataStructure[k.toUpperCase()]()

export default GenPrototype
