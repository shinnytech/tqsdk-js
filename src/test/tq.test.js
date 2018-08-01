describe('指标中下单', function () {
    var TQ = new TQSDK(new MockWebsocket());
    var symbol = "CFFEX.IF1801";
    var dur = 5;
    before( () => {
        TQ.REGISTER_INDICATOR_CLASS(mat);
        TQ.on_rtn_data(init_test_data());
        TQ.on_rtn_data(batch_input_datas({
            symbol,
            dur,
            left_id: 100,
            right_id: 1000,
            last_id: 1000
        }));
    });

    it('发送 mk 序列', function () {
        //请求创建指标实例
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "mat",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 600,
            "view_right": 2000,
            "params": {},
            "enable_trade": true, //可选, 技术指标是否有权下单, 默认为false, 不执行交易操作
            "trade_symbol": symbol, //可选, 设定该指标下单时默认使用的合约代码。不指定时默认为与 ins_id 字段相同
            "order_id_prefix": "abcd", //可选, 设定该指标下单时默认使用的单号前缀。不指定时为空
            "volume_limit": 10  //可选, 设定该指标下单时最大可开仓手数，不指定或设定为0时表示不限制
        };
        TQ.on_update_indicator_instance(r);
        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.aid, "set_indicator_data");
        assert.equal(send_obj.instance_id, "abc324238");
        assert.equal(send_obj.epoch, 1);
        assert.equal(send_obj.range_left, 600);
        assert.equal(send_obj.range_right, 1000);
        console.log(Object.keys(send_obj.serials))
        assert.equal(send_obj.datas.ma3[0].length, 401);
        // assert.equal(send_obj.datas.mk[0][0], 1);
        // assert.equal(send_obj.datas.mk[0][1], 2);

        TQ.on_rtn_data(batch_input_datas({TQ, symbol, dur:5, left_id:1001, right_id:1001, last_id:1001}));

        send_obj = TQ.ws.send_objs.pop();

        assert.equal(send_obj.aid, "set_indicator_data");
        assert.equal(send_obj.instance_id, "abc324238");
        assert.equal(send_obj.epoch, 1);
        assert.equal(send_obj.range_left, 1000);
        assert.equal(send_obj.range_right, 1001);
        assert.equal(send_obj.datas.ma3[0].length, 2);
        // assert.equal(send_obj.datas.mk[0][0], 1);
        // assert.equal(send_obj.datas.mk[0][1], 2);

    });
});
