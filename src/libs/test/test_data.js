module.exports.init_test_data = function (TQ) {
    TQ.dm.on_rtn_data({
        "aid": "rtn_data",                                        // 数据推送
        "data": [                                                 // diff数据数组, 一次推送中可能含有多个数据包
            {
                "quotes": { //实时行情数据
                    "SHFE.rb1810": {
                        "instrument_id": "SHFE.rb1810", //合约代码
                        "ask_price1": 3446.0, //卖价
                        "ask_volume1": 99, //卖量
                        "bid_price1": 3444.0, //买价
                        "bid_volume1": 901, //买量
                        "last_price": 3446.0, // 最新价
                        "change": 57.0,
                        "change_percent": 0.01681912068456772,
                        "highest": 3496.0, // 最高价
                        "lowest": 3410.0, // 最低价
                        "volume": 6277210, // 成交量
                        "open_interest": 2901930, // 持仓量
                        "pre_open_interest": 2927264, // 昨持
                        "pre_close": 3384.0, // 昨收
                        "open": 3411.0, // 今开
                        "close": 3446.0, // 收盘
                        "lower_limit": 3151.0, // 跌停
                        "upper_limit": 3626.0, // 涨停
                        "average": 3447.769, // 均价
                        "pre_settlement": 3389.0, // 昨结
                        "amount": 216423683180.0, // 成交额
                        "settlement":3447.0, // 结算价
                        "datetime_epoch_nano": 1524034799500003000,
                        "datetime": "2018-04-18 14:59:59.500003" //时间
                    }
                },
                "klines": {                                           //K线数据
                    "SHFE.cu1601": {                                         //合约代码
                        180000000000: {                                   //K线周期, 单位为纳秒, 180000000000纳秒 = 3分钟
                            "last_id": 3435,                                //整个序列最后一个记录的序号
                            "data": {
                                3434: {
                                    "datetime": 192837100000000,                //UnixNano 北京时间，如果是日线，则是交易日的 UnixNano
                                    "open": 3434,                            //开
                                    "high": 3434,                            //高
                                    "low": 3434,                             //低
                                    "close": 3434,                           //收
                                    "volume": 3434,                                //成交量
                                    "open_oi": 3434,                            //起始持仓量
                                    "close_oi": 3434,                           //结束持仓量
                                },
                                3435: {
                                    "datetime": 192837400000000,                //UnixNano 北京时间，如果是日线，则是交易日的 UnixNano
                                    "open": 3435,                            //开
                                    "high": 3435,                            //高
                                    "low": 3435,                             //低
                                    "close": 3435,                           //收
                                    "volume": 3435,                                //成交量
                                    "open_oi": 3435,                            //起始持仓量
                                    "close_oi": 3435,                           //结束持仓量
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
                            "xxxxx": {                                    //order_key, 用于唯一标识一个委托单
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
}

/**
 * dur = 0  就生成 tick 数据
 */
module.exports.batch_input_datas = function({TQ, symbol='SHFE.rb1810', dur=5, left_id=100, right_id=1000, last_id=1000} = {}){
    let obj = {
        "last_id": last_id,
        "data": {},
    };
    for(let i = left_id; i<= right_id; i++){
        obj.data[i] = {
            "datetime": i,
            "open": i,
            "high": i,
            "low": i,
            "close": i,
            "volume": i,
            "open_oi": i,
            "close_oi": i,
        }
    }

    if (dur == 0){
        TQ.on_rtn_data({
            "aid": "rtn_data",
            "data": [
                {"ticks": {
                        [symbol]: obj,
                    },
                }
            ]
        });
    }else{
        TQ.on_rtn_data({
            "aid": "rtn_data",
            "data": [
                {"klines": {
                        [symbol]: {
                            [dur * 1000000000]: obj,
                        },
                    },
                }
            ]
        });
    }
}

module.exports.MockWebsocket = class MockWebsocket{
    constructor(url, callbacks){
        this.send_objs = [];
    }
    send_json(obj) {
        this.send_objs.push(obj);
    };
    isReady() {
        return true;
    };
    init() {
    };
}
