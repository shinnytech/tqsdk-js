var assert = require('assert');
var {TQSDK, Indicator} = require('../src/libs/tqsdk.js');

class MockWebsocket{
    constructor(url, callbacks){
    }
    send_json(obj) {
    };
    isReady() {
        return true;
    };
    init() {
    };
}

var TQ = new TQSDK(new MockWebsocket());

describe('dm', function () {
    TQ.dm.on_rtn_data({
        "aid": "rtn_data",                                        //数据推送
        "data": [                                                 //diff数据数组, 一次推送中可能含有多个数据包
            {
                "quotes": {                                           //实时行情数据
                    "SHFE.cu1612": {
                        "instrument_id": "cu1612",                        //合约代码
                        "datetime": "2016-12-30 13:21:32.500000",         //时间
                        "ask_price1": 36590.0,                            //卖价
                        "ask_volume1": 121,                               //卖量
                        "bid_price1": 36580.0,                            //买价
                        "bid_volume1": 3,                                 //买量
                        "last_price": 36580.0,                            //最新价
                        "highest": 36580.0,                               //最高价
                        "lowest": 36580.0,                                //最低价
                        "amount": 213445312.5,                            //成交额
                        "volume": 23344,                                  //成交量
                        "open_interest": 23344,                           //持仓量
                        "pre_open_interest": 23344,                       //昨持
                        "pre_close": 36170.0,                             //昨收
                        "open": 36270.0,                                  //今开
                        "close": 36270.0,                                 //收盘
                        "lower_limit": 34160.0,                           //跌停
                        "upper_limit": 38530.0,                           //涨停
                        "average": 36270.1,                               //均价
                        "pre_settlement": 36270.0,                        //昨结
                        "settlement": 36270.0,                            //结算价
                    },
                },
                "klines": {                                           //K线数据
                    "SHFE.cu1601": {                                         //合约代码
                        180000000000: {                                   //K线周期, 单位为纳秒, 180000000000纳秒 = 3分钟
                            "last_id": 3435,                                //整个序列最后一个记录的序号
                            "data": {
                                3435: {
                                    "datetime": 192837400000000,                //UnixNano 北京时间，如果是日线，则是交易日的 UnixNano
                                    "open": 3432.33,                            //开
                                    "high": 3432.33,                            //高
                                    "low": 3432.33,                             //低
                                    "close": 3432.33,                           //收
                                    "volume": 2,                                //成交量
                                    "open_oi": 1632,                            //起始持仓量
                                    "close_oi": 1621,                           //结束持仓量
                                },
                            },
                            "binding": {
                                "cu1709": {
                                    3384: 2900,                                 //本合约K线所对应的另一个合约的K线号
                                    3385: 2950,
                                }
                            }
                        },
                    },
                },
                "ticks": {
                    "cu1601": {
                        "last_id": 3550,                                  //整个序列最后一个元素的编号
                        "data": {
                            3384: {
                                "datetime": 1928374000000000,                 //UnixNano 北京时间
                                "trading_day": 1928374000000000,              //交易日的UnixNano 北京时间
                                "last_price": 3432.33,                        //最新价
                                "highest": 3452.33,                           //最高价
                                "lowest": 3402.33,                            //最低价
                                "bid_price1": 3432.2,                         //买一价
                                "ask_price1": 3432.4,                         //卖一价
                                "bid_volume1": 1,                             //买一量
                                "ask_volume1": 2,                             //卖一量
                                "volume": 200,                                //成交量
                                "open_interest": 1621,                        //持仓量
                            },
                        }
                    },
                },
                "notify": {                                           //通知信息
                    "2010": {
                        "type": "MESSAGE",                                //MESSAGE TEXT
                        "code": 1000,
                        "content": "abcd",
                    }
                },
                "trade": {                                            //交易相关数据
                    "user1": {                                          //登录用户名
                        "user_id": "user1",                               //登录用户名
                        "accounts": {                                     //账户资金信息
                            "CNY": {                                        //account_key, 通常为币种代码
                                //核心字段
                                "account_id": "423423",                       //账号
                                "currency": "CNY",                            //币种
                                "balance": 9963216.550000003,                 //账户权益
                                "available": 9480176.150000002,               //可用资金
                                                                              //参考字段
                                "pre_balance": 12345,                         //上一交易日结算时的账户权益
                                "deposit": 42344,                             //本交易日内的入金金额
                                "withdraw": 42344,                            //本交易日内的出金金额
                                "commission": 123,                            //本交易日内交纳的手续费
                                "preminum": 123,                              //本交易日内交纳的权利金
                                "static_balance": 124895,                     //静态权益
                                "position_profit": 12345,                     //持仓盈亏
                                "float_profit": 8910.231,                     //浮动盈亏
                                "risk_ratio": 0.048482375,                    //风险度
                                "margin": 11232.23,                           //占用资金
                                "frozen_margin": 12345,                       //冻结保证金
                                "frozen_commission": 123,                     //冻结手续费
                                "frozen_premium": 123,                        //冻结权利金
                                "close_profit": 12345,                        //本交易日内平仓盈亏
                                "position_profit": 12345,                     //当前持仓盈亏
                            }
                        },
                        "positions": {                                    //持仓
                            "SHFE.cu1801": {                                //合约代码
                                "exchange_id": "SHFE",                        //交易所
                                "instrument_id": "cu1801",                    //交易所内的合约代码
                                "volume_long": 5,                             //多头持仓手数
                                "volume_short": 5,                            //空头持仓手数
                                "hedge_flag": "SPEC",                         //套保标记
                                "open_price_long": 3203.5,                    //多头开仓均价
                                "open_price_short": 3100.5,                   //空头开仓均价
                                "open_cost_long": 3203.5,                     //多头开仓市值
                                "open_cost_short": 3100.5,                    //空头开仓市值
                                "margin": 32324.4,                            //占用保证金
                                "float_profit_long": 32324.4,                 //多头浮动盈亏
                                "float_profit_short": 32324.4,                //空头浮动盈亏
                                "volume_long_today": 5,                       //多头今仓手数
                                "volume_long_his": 5,                         //多头老仓手数
                                "volume_long_frozen": 5,                      //多头持仓冻结
                                "volume_long_frozen_today": 5,                //多头今仓冻结
                                "volume_short_today": 5,                      //空头今仓手数
                                "volume_short_his": 5,                        //空头老仓手数
                                "volume_short_frozen": 5,                     //空头持仓冻结
                                "volume_short_frozen_today": 5,               //空头今仓冻结
                            }
                        },
                        "orders": {                                       //委托单
                            "abc|123": {                                    //order_key, 用于唯一标识一个委托单
                                "order_id": "123",                            //委托单ID, 对于一个用户的所有委托单，这个ID都是不重复的
                                "exchange_id": "SHFE",                        //交易所
                                "instrument_id": "cu1801",                    //合约代码
                                "direction": "BUY",                           //下单方向
                                "offset": "OPEN",                             //开平标志
                                "volume_orign": 6,                            //总报单手数
                                "volume_left": 3,                             //未成交手数
                                "price_type": "LIMIT",                        //价格类型
                                "limit_price": 45000,                         //委托价格, 仅当 price_type = LIMIT 时有效
                                "status": "ALIVE",                            //委托单状态, ALIVE=有效, FINISHED=已完
                                "insert_date_time": 1928374000000000,         //下单时间
                                "exchange_order_id": "434214",                //交易所单号
                            }
                        },
                        "trades": {                                       //成交记录
                            "abc|123|1": {                                  //trade_key, 用于唯一标识一个成交项
                                "order_id": "123",
                                "exchange_id": "SHFE",                        //交易所
                                "instrument_id": "cu1801",                    //交易所内的合约代码
                                "exchange_trade_id": "1243",                  //交易所成交号
                                "direction": "BUY",                           //成交方向
                                "offset": "OPEN",                             //开平标志
                                "volume": 6,                                  //成交手数
                                "price": 1234.5,                              //成交价格
                                "trade_date_time": 1928374000000000           //成交时间
                            }
                        },
                    },
                }
            }
        ]
    });
    it('GetQuote with symbol', function () {
        var q = TQ.GET_QUOTE("SHFE.cu1612");
        assert.equal(q.last_price, 36580.0);
    });
    it('GET_KLINE with all params', function () {
        var q = TQ.GET_KLINE({
            symbol: "SHFE.cu1601",
            duration: 180,
        });
        assert.equal(q[-1].close, 3432.33);
        // assert.equal(q.close[-1], 3432.33);
    });
    it('2', function () {
        // assert(n == 2);
        // n += 1;
        // assert(Object.keys(dm.datas).length == 0);
        // expect(4 + 5).to.be.equal(9);
        // assert.equal(dm.datas, {});
    });
});


class kdj extends Indicator
{
    static define() {
        return {
            type: "SUB",
            cname: "KDJ",
            state: "KLINE",
            params: [
                {name: "N", default:3},
                {name: "M1", default:5},
                {name: "M2", default:5},
            ],
        }
    }
    constructor(){
        super();
        //输入序列
        this.ks = TQ.GET_KLINE();
        this.k = this.OUTS("LINE", "k", {color: RED});
        this.d = this.OUTS("LINE", "d", {color: GREEN});
        this.j = this.OUTS("LINE", "j", {color: YELLOW});
        this.rsv = [];
    }
    calc(i) {
        let hv = HIGHEST(i, this.ks.high, this.params.n);
        let lv = LOWEST(i, this.ks.low, this.params.n);
        rsv[i] = (hv == lv) ? 0 : (this.ks.close[i] - lv) / (hv - lv) * 100;
        this.k[i] = SMA(i, rsv, m1, 1, k);
        this.d[i] = SMA(i, k, m2, 1, d);
        this.j[i] = 3*k[i] - 2*d[i];
    }
}

describe('ta', function () {
    TQ.ta.register_indicator_class(kdj);
    it('New indicator instance', function () {
        let ind = TQ.NEW_INDICATOR_INSTANCE(kdj, {});
    });
});