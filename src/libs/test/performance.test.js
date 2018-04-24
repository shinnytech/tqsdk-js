var assert = require('assert');
var {init_test_data, batch_input_datas, MockWebsocket} = require('./test_data.js');
var importScripts = require('./importScripts.js');
importScripts('src/libs/func/basefuncs.js', 'src/libs/tqsdk.js', 'src/libs/ind/ma.js', 'src/libs/ind/macd.js');

var TQ = new TQSDK(new MockWebsocket());
init_test_data(TQ);
batch_input_datas({TQ, symbol: 'SHFE.rb1810', dur:5, left_id:1, right_id:100000, last_id:100000});

TQ.REGISTER_INDICATOR_CLASS(ma);
TQ.REGISTER_INDICATOR_CLASS(macd);

describe('performance', function () {
    it('ma 10,000 个数据', function () {
        this.slow(50);
        this.timeout(100);
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let ind = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec);
        assert.equal(ind.outs.ma3(1, 10000).length, 10000);
    });

    it('macd 10,000 个数据', function () {
        this.slow(20);
        this.timeout(100);
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let ind = TQ.NEW_INDICATOR_INSTANCE(macd, symbol, dur_sec);
        assert.equal(ind.outs.bar(1, 10000).length, 10000);
    });

    it('ma 100,000 个数据', function () {
        this.slow(500);
        this.timeout(1000);
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let ind = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec);
        assert.equal(ind.outs.ma3(1, 100000).length, 100000);
    });

    it('macd 100,000 个数据', function () {
        this.slow(200);
        this.timeout(1000);
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let ind = TQ.NEW_INDICATOR_INSTANCE(macd, symbol, dur_sec);
        assert.equal(ind.outs.bar(1, 100000).length, 100000);
    });

});
