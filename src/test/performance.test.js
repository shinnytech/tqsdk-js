describe('performance', function () {
    var TQ = new TQSDK(new MockWebsocket());
    var symbol = 'SHFE.rb1810';
    var dur = 5;
    before( () => {
        TQ.REGISTER_INDICATOR_CLASS(ma); // 定义指标
        TQ.REGISTER_INDICATOR_CLASS(macd);
        TQ.on_rtn_data(init_test_data());
        TQ.on_rtn_data(batch_input_datas({
            symbol,
            dur,
            left_id: 1,
            right_id: 100000,
            last_id: 100000
        }));
    });

    it('ma 10,000 个数据', function () {
        this.slow(50);
        this.timeout(100);
        let ind = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur);
        assert.equal(ind.outs.ma3(1, 10000).length, 10000);
    });

    it('macd 10,000 个数据', function () {
        this.slow(20);
        this.timeout(100);
        let ind = TQ.NEW_INDICATOR_INSTANCE(macd, symbol, dur);
        assert.equal(ind.outs.bar(1, 10000).length, 10000);
    });

    it('ma 100,000 个数据', function () {
        this.slow(500);
        this.timeout(1000);
        let ind = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur);
        assert.equal(ind.outs.ma3(1, 100000).length, 100000);
    });

    it('macd 100,000 个数据', function () {
        this.slow(200);
        this.timeout(1000);
        let ind = TQ.NEW_INDICATOR_INSTANCE(macd, symbol, dur);
        assert.equal(ind.outs.bar(1, 100000).length, 100000);
    });

});
