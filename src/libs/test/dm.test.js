var assert = require('assert');
var {init_test_data, batch_input_datas} = require('./test_data.js');
var importScripts = require('./importScripts.js');
importScripts('src/libs/tqsdk.js');

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
        var q = TQ.GET_QUOTE("SHFE.rb1810");
        assert.equal(q.last_price, 3446.0);
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
        assert.equal(ks.length, 2);
        assert.equal(ks[0].close, 3434);
        assert.equal(ks[1].close, 3435);
    });

    it('clear_data', function () {
        TQ.dm.clear_data();
        assert.equal(Object.keys(TQ.dm.datas).length, 0);
    });
});
