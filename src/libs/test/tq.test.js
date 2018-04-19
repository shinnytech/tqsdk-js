var assert = require('assert');
var importScripts = require('./importScripts.js')

importScripts('src/libs/func/basefuncs.js', 'src/libs/tqsdk.js')

class MockWebsocket{
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

var TQ = new TQSDK(new MockWebsocket());

function init_test_data(){
    TQ.dm.on_rtn_data({
        "aid": "rtn_data",                                        //数据推送
        "data": [                                                 //diff数据数组, 一次推送中可能含有多个数据包
            {
                "quotes": {                                           //实时行情数据
                    "CFFEX.IF1801": {
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
}

describe('dm', function () {

    it('update_data mergeObject', function (){
        init_test_data(TQ);
        assert.equal(Object.keys(TQ.dm.datas).length, 6);
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
                        }
                    }
                }
            ]
        });
        assert.equal(TQ.dm.is_changing(account), true);
        assert.equal(TQ.dm.is_changing(positions), false);
    });
    it('GetQuote with symbol', function () {
        var q = TQ.GET_QUOTE("CFFEX.IF1801");
        assert.equal(q.last_price, 36580.0);
    });
    it('GET_KLINE with all params', function () {
        var q = TQ.GET_KLINE({
            symbol: "SHFE.cu1601",
            duration: 180,
        });
        assert.equal(q[-1].close, 3435);
        assert.equal(q.close[-1], 3435);

        let ds = q.close.slice(-2);
        assert.equal(ds.length, 2);
        assert.equal(ds[0], 3434);
        assert.equal(ds[1], 3435);
        let ks = q.slice(-2);
        assert.equal(ks[0].close, 3434);
        assert.equal(ks[1].close, 3435);
    });

    it('clear_data', function () {
        TQ.dm.clear_data();
        assert.equal(Object.keys(TQ.dm.datas).length, 0);
    });
});


class ma extends Indicator
{
    static define() {
        return {
            type: "SUB",
            cname: "MA",
            state: "KLINE",
            params: [
                {name: "N", default: 3},
            ],
        };
    }
    init(){
        this.m = this.OUTS("LINE", "m", {color: RED});
    }
    calc(i) {
        this.m[i] = MA(i, this.DS.close, this.PARAMS.N, this.m);
    }
}

class IndOrder extends Indicator
{
    static define() {
        return {};
    }
    init(){
    }
    calc(i){
        this.ORDER(i, "BUY", "OPEN", 1);
    }
}

function batch_input_datas(left_id, right_id, last_id){
    data = {};
    for(let i = left_id; i<= right_id; i++){
        data[i] = {
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
    TQ.on_rtn_data({
        "aid": "rtn_data",
        "data": [
            {
                "klines": {
                    "CFFEX.IF1801": {
                        5000000000: {
                            "last_id": last_id,
                            "data": data,
                        },
                    },
                },
            }
        ]
    });
}

describe('ta', function () {
    init_test_data();
    batch_input_datas(1000, 10000, 10000);
    TQ.ta.register_indicator_class(ma);
    it('指标简单计算', function () {
        let symbol = "CFFEX.IF1801";
        let dur_sec = 5;
        let ind1 = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec, {
            "N": 1,
        });
        assert.equal(ind1.outs.m(-1), 10000);
        let ind2 = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec, {
            "N": 10,
        });
        assert.equal(ind2.outs.m(-1), 9995.5);

        // assert.equal(ind2.outs.m[-1], 9995.5);
        // assert.equal(ind2.outs.m.slice(-5, -1), [..]);
    });

    it('更新指标计算范围', function () {
        let symbol = "CFFEX.IF1801";
        let dur_sec = 5;
        let params = { "N": 5 };
        let ind = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec, params);
        let outs_data = ind.outs.m(1000, 1010);

        assert.equal(outs_data.length, 10);
        // [ NaN, NaN, NaN, NaN, 1002, 1003, 1004, 1005, 1006, 1007 ]
        assert.ok(isNaN(outs_data[0]));
        assert.ok(isNaN(outs_data[3]));
        assert.equal(outs_data[4], 1002);
        assert.equal(outs_data[9], 1007);

        outs_data = ind.outs.m(9990, 10000);

        assert.equal(outs_data.length, 10);
        assert.equal(outs_data[0], 9988);
        assert.equal(outs_data[4], 9992);
        assert.equal(outs_data[9], 9997);
    });

    // calculate

    it('删除指标实例 (delete_indicator_instance)', function(){
        let symbol = "CFFEX.IF1801";
        let dur_sec = 5;
        let params = { "N": 5 };
        let ind = TQ.ta.new_indicator_instance(ma, symbol, dur_sec, params);
        assert.ok(TQ.ta.instance_dict[ind.id]);
        TQ.ta.delete_indicator_instance(ind);
        assert.equal(TQ.ta.instance_dict[ind.id], undefined);
    });

    it('删除指标类 (unregister_indicator_class)', function () {
        assert.ok(TQ.ta.class_dict["ma"]);
        TQ.ta.unregister_indicator_class(ma);
        assert.equal(TQ.ta.class_dict["ma"], undefined);
    });
});


describe('技术指标与图表结合使用', function () {
    init_test_data();
    TQ.ta.register_indicator_class(ma);
    it('常规流程', function () {
        //初始化数据到(1000, 3000)
        batch_input_datas(1000, 3000, 3000);
        //请求创建指标实例
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": "CFFEX.IF1801",
            "dur_nano": 5000000000,
            "view_left": 2800,
            "view_right": 4000,
            "params": {
                "N": {"value": 10},
            }
        };
        TQ.on_update_indicator_instance(r);
        //预期将向主程序发送一个 set_indicator_data 包, 检查这个包的内容
        assert.equal(TQ.ws.send_objs.length, 1);
        let send_obj = TQ.ws.send_objs[0];
        assert.equal(send_obj.aid, "set_indicator_data");
        assert.equal(send_obj.instance_id, "abc324238");
        assert.equal(send_obj.epoch, 1);
        assert.equal(send_obj.range_left, 2800);
        assert.equal(send_obj.range_right, 3000);
        assert.equal(send_obj.datas.m[0].length, 201);
        assert(!isNaN(send_obj.datas.m[0][0]));
        assert.equal(send_obj.datas.m[0][10], 2805.5);
        assert.equal(send_obj.datas.m[0][200], 2995.5);
        TQ.ws.send_objs = [];
        //更新一波行情数据
        //预期会向主程序发送 set_indicator_data 包, 增补前次未发送的数据
        batch_input_datas(3001, 3001, 3001);
        assert.equal(TQ.ws.send_objs.length, 1);
        let send_obj_2 = TQ.ws.send_objs[0];
        assert.equal(send_obj_2.range_left, 3000);
        assert.equal(send_obj_2.range_right, 3001);
        assert.equal(send_obj_2.datas.m[0][1], 2996.5);
        TQ.ws.send_objs = [];
        //更新指标参数(只调整 view_left和 view_right)
        //预期会向主程序发送 set_indicator_data 包, 增补前次未发送的数据
        let r2 = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": "CFFEX.IF1801",
            "dur_nano": 5000000000,
            "view_left": 2600,
            "view_right": 4000,
            "params": {
                "N": {"value": 10},
            }
        };
        TQ.on_update_indicator_instance(r2);
        assert.equal(TQ.ws.send_objs.length, 1);
        let send_obj_3 = TQ.ws.send_objs[0];
        assert.equal(send_obj_3.range_left, 2600);
        assert.equal(send_obj_3.range_right, 3001);
        assert.equal(send_obj_3.datas.m[0][0], 2595.5);
        TQ.ws.send_objs = [];
        //更新指标参数(更换合约/周期)
        //预期会向主程序发送 set_indicator_data 包, 所有数据会重算
    });
});

describe('指标中下单', function () {
    init_test_data();
    TQ.ta.register_indicator_class(IndOrder);
    it('常规流程', function () {
        //初始化数据到(1000, 3000)
        batch_input_datas(1000, 3000, 3000);
        //请求创建指标实例
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "IndOrder",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": "CFFEX.IF1801",
            "dur_nano": 5000000000,
            "view_left": 2800,
            "view_right": 4000,
            "params": {
                "N": {"value": 10},
            },
            "enable_trade": true,                       //可选, 技术指标是否有权下单, 默认为false, 不执行交易操作
            "trade_symbol": "CFFEX.IF1801",              //可选, 设定该指标下单时默认使用的合约代码。不指定时默认为与 ins_id 字段相同
            "order_id_prefix": "abcd",                  //可选, 设定该指标下单时默认使用的单号前缀。不指定时为空
            "volume_limit": 10,                         //可选, 设定该指标下单时最大可开仓手数，不指定或设定为0时表示不限制
        };
        TQ.on_update_indicator_instance(r);
        TQ.ws.send_objs = [];
        batch_input_datas(3000, 3010, 3010);
        assert.equal(TQ.ws.send_objs.length, 2);
        let send_obj_insert_order = TQ.ws.send_objs[0];
        assert.equal(send_obj_insert_order.aid, "insert_order");
        let send_obj_set_indicator_data = TQ.ws.send_objs[1];
        assert.equal(send_obj_set_indicator_data.aid, "set_indicator_data");
        // assert.equal(send_obj.epoch, 1);
        // assert.equal(send_obj.range_left, 2800);
        // assert.equal(send_obj.range_right, 3000);
        // assert.equal(send_obj.datas.m[0].length, 201);
        // assert(!isNaN(send_obj.datas.m[0][0]));
        // assert.equal(send_obj.datas.m[0][10], 2805.5);
        // assert.equal(send_obj.datas.m[0][200], 2995.5);
        TQ.ws.send_objs = [];
    });
});


describe('下单', function () {
    init_test_data();
    it('单个函数', function () {
        //下单
        let order = TQ.INSERT_ORDER({
            symbol: "SHFE.cu1601",
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2000,
            prefix: "abc",
        });
        //预期将向主程序发送一个 insert_order 包, 检查这个包的内容
        assert.equal(TQ.ws.send_objs.length, 1);
        let send_obj = TQ.ws.send_objs[0];
        assert.equal(send_obj.aid, "insert_order");
    });
});


describe('撤单', function () {
    init_test_data();
    it('撤单个单', function () {
        //下单
        let order = TQ.INSERT_ORDER({
            symbol: "SHFE.cu1601",
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2000,
            prefix: "abc",
        });
        TQ.CANCEL_ORDER(order);
        //预期将向主程序发送一个 cancel_order 包, 检查这个包的内容
    });
    it('批量撤单', function () {
        //下单
        let order = TQ.INSERT_ORDER({
            symbol: "SHFE.cu1601",
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2000,
            prefix: "abc",
        });
        TQ.CANCEL_ORDER("abc");
    });
});
