var assert = require('assert');
var {init_test_data, batch_input_datas, MockWebsocket} = require('./test_data.js');
var importScripts = require('./importScripts.js');
importScripts('src/libs/tqsdk.js');

var TQ = new TQSDK(new MockWebsocket());
init_test_data(TQ);

describe('dm', function () {

    it('update_data mergeObject', function (){
        assert.ok(TQ.dm.datas.klines);
        assert.ok(TQ.dm.datas.quotes);
        assert.ok(TQ.dm.datas.quotes['SHFE.rb1810']);
        assert.equal(TQ.dm.datas.quotes['SHFE.rb1810'].last_price, 3446.0);
    });

    it('is_changing', function () {
        let account = TQ.GET_ACCOUNT();
        let positions = TQ.GET_POSITION('SHFE.cu1805');
        TQ.on_rtn_data({
            "aid": "rtn_data",
            "data": [
                {
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
                        }
                    }
                }
            ]
        });
        assert.equal(TQ.dm.is_changing(account), true);
        assert.equal(TQ.dm.is_changing(positions), false);
    });
    it('GetQuote with symbol', function () {
        var q = TQ.GET_QUOTE("SHFE.rb1810");
        assert.equal(q.last_price, 3446.0);
    });
    it('GET_KLINE with all params', function () {
        var q = TQ.GET_KLINE({
            symbol: "SHFE.cu1601",
            duration: 180,
        });
        assert.equal(q[q.length-1].close, 3435);
        assert.equal(q.close[q.length-1], 3435);

        let ds = q.close.slice(-2);
        assert.equal(ds.length, 2);
        assert.equal(ds[0], 3434);
        assert.equal(ds[1], 3435);


        let ks = q.slice(-2);
        assert.equal(ks.length, 2);
        assert.equal(ks[0].close, 3434);
        assert.equal(ks[1].close, 3435);
    });

    it('unit_insert_order', function () {
        let tq = new TQSDK(new MockWebsocket());
        init_test_data(tq);
        tq.INSERT_ORDER({symbol:"SHFE.cu1801", direction:"BUY", offset:"OPEN", order_id:"A.B.D"});
        let p2 = tq.GET_UNIT_POSITION("A.B", "SHFE.cu1801");
        assert.equal(p2.order_volume_buy_open, 1);
    });

    it('unit_order', function () {
        let tq = new TQSDK(new MockWebsocket());
        init_test_data(tq);

        tq.on_rtn_data({
            "aid": "rtn_data",                                        // 数据推送
            "data": [                                                 // diff数据数组, 一次推送中可能含有多个数据包
                {
                    "trade": {                                            //交易相关数据
                        "user1": {                                          //登录用户名
                            "orders": {                                       //委托单
                                "A.B.C": {                                    //order_key, 用于唯一标识一个委托单
                                    "order_id": "A.B.C",                            //委托单ID, 对于一个用户的所有委托单，这个ID都是不重复的
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
                        },
                    }
                }
            ]
        });
        let p0 = tq.GET_UNIT_POSITION("", "SHFE.cu1801");
        let p1 = tq.GET_UNIT_POSITION("A", "SHFE.cu1801");
        let p2 = tq.GET_UNIT_POSITION("A.B", "SHFE.cu1801");
        assert.equal(p0.order_volume_buy_open, 3);
        assert.equal(p1.order_volume_buy_open, 3);
        assert.equal(p2.order_volume_buy_open, 3);
        tq.on_rtn_data({
            "aid": "rtn_data",                                        // 数据推送
            "data": [                                                 // diff数据数组, 一次推送中可能含有多个数据包
                {
                    "trade": {                                            //交易相关数据
                        "user1": {                                          //登录用户名
                            "orders": {                                       //委托单
                                "A.B.C": {                                    //order_key, 用于唯一标识一个委托单
                                    "order_id": "A.B.C",                            //委托单ID, 对于一个用户的所有委托单，这个ID都是不重复的
                                    "exchange_id": "SHFE",                        //交易所
                                    "instrument_id": "cu1801",                    //合约代码
                                    "direction": "BUY",                           //下单方向
                                    "offset": "OPEN",                             //开平标志
                                    "volume_left": 3,                             //未成交手数
                                    "price_type": "LIMIT",                        //价格类型
                                    "status": "FINISHED",                            //委托单状态, ALIVE=有效, FINISHED=已完
                                }
                            },
                        },
                    }
                }
            ]
        });
        assert.equal(p0.order_volume_buy_open, 0);
    });

    it('unit_trade', function () {
        let tq = new TQSDK(new MockWebsocket());
        init_test_data(tq);

        let p0 = tq.GET_UNIT_POSITION("", "SHFE.cu1801");
        let p1 = tq.GET_UNIT_POSITION("A", "SHFE.cu1801");
        let p2 = tq.GET_UNIT_POSITION("A.B", "SHFE.cu1801");
        tq.on_rtn_data({
            "aid": "rtn_data",                                        // 数据推送
            "data": [                                                 // diff数据数组, 一次推送中可能含有多个数据包
                {
                    "trade": {                                            //交易相关数据
                        "user1": {                                          //登录用户名
                            "trades": {                                       //成交记录
                                "A.B.C.1": {                                  //trade_key, 用于唯一标识一个成交项
                                    "order_id": "A.B.C",
                                    "exchange_id": "SHFE",                        //交易所
                                    "instrument_id": "cu1801",                    //交易所内的合约代码
                                    "direction": "BUY",                           //成交方向
                                    "offset": "OPEN",                             //开平标志
                                    "volume": 6,                                  //成交手数
                                    "price": 1000,                              //成交价格
                                }
                            },
                        },
                    }
                }
            ]
        });
        assert.equal(p0.volume_long, 6);
        assert.equal(p0.cost_long, 6000);

        tq.on_rtn_data({
            "aid": "rtn_data",                                        // 数据推送
            "data": [                                                 // diff数据数组, 一次推送中可能含有多个数据包
                {
                    "trade": {                                            //交易相关数据
                        "user1": {                                          //登录用户名
                            "trades": {                                       //成交记录
                                "A.B.C.1": {                                  //trade_key, 用于唯一标识一个成交项
                                    "order_id": "A.B.C",
                                    "exchange_id": "SHFE",                        //交易所
                                    "instrument_id": "cu1801",                    //交易所内的合约代码
                                    "direction": "SELL",                           //成交方向
                                    "offset": "CLOSE",                             //开平标志
                                    "volume": 3,                                  //成交手数
                                    "price": 2000,                              //成交价格
                                }
                            },
                        },
                    }
                }
            ]
        });
        assert.equal(p0.volume_long, 3);
        assert.equal(p0.cost_long, 3000);
    });

    it('clear_data', function () {
        TQ.dm.clear_data();
        assert.equal(Object.keys(TQ.dm.datas).length, 0);
    });
});
