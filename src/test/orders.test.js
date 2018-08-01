
let order_ids = [];

describe('下单', function () {
    var TQ = new TQSDK(new MockWebsocket());
    var symbol = "CFFEX.IF1801";
    var dur = 5;

    before( () => {
        TQ.REGISTER_INDICATOR_CLASS(ma); // 定义指标
        TQ.on_rtn_data(init_test_data());
        TQ.on_rtn_data(batch_input_datas({
            symbol,
            dur,
            left_id: 1000,
            right_id: 10000,
            last_id: 10000
        }));
    });

    it('单个函数', function () {
        //下单
        let order1 = TQ.INSERT_ORDER({
            symbol,
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            price_type: "LIMIT",
            limit_price: 2000,
            prefix: "abc",
            unit_id: "EXT"
        });

        assert.ok(order1.order_id.includes('EXT'));
        assert.equal(order1.volume_orign, 2);

        order_ids.push(order1.order_id);

        // 预期将向主程序发送一个 insert_order 包, 检查这个包的内容
        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.aid, "insert_order");
        assert.equal(send_obj.volume, 2);
    });

    it('撤单个单', function () {
        //下单
        let order2 = TQ.INSERT_ORDER({
            symbol,
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2200,
            unit_id: "EXT",
        });
        TQ.CANCEL_ORDER(order2);

        //预期将向主程序发送一个 cancel_order 包, 检查这个包的内容
        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.aid, "cancel_order");

        // 模拟撤单成功
        TQ.on_rtn_data({
            "aid": "rtn_data",
            "data": [
                {"trade": {
                    "user1": {
                        "orders": {
                            [order2.order_id]: {
                                direction: "BUY",
                                offset: "OPEN",
                                status: "FINISHED"
                            }
                        }
                    }
                }}
            ]
        });
    });
    //
    // it('批量获取订单', function () {
    //     //下单
    //     let order3 = TQ.INSERT_ORDER({
    //         symbol,
    //         direction: "BUY",
    //         offset: "OPEN",
    //         volume: 2,
    //         limit_price: 2200,
    //         unit_id: "EXT",
    //     });
    //     order_ids.push(order3.order_id);
    //     let order4 = TQ.INSERT_ORDER({
    //         symbol,
    //         direction: "BUY",
    //         offset: "OPEN",
    //         volume: 2,
    //         limit_price: 2100,
    //         unit_id: "def",
    //     });
    //     order_ids.push(order4.order_id);
    //     // let orders = TQ.GET_ORDER_DICT({
    //     //
    //     // });
    //     // assert.equal(Object.keys(orders).length, 4);
    //
    //     let orders_abc = TQ.GET_ORDER_DICT();
    //     assert.equal(Object.keys(orders_abc).length, 3);
    //
    //     var orders_def = TQ.GET_ORDER_DICT();
    //     assert.equal(Object.keys(orders_def).length, 1);
    // });

    it('批量撤单', function () {
        var length = TQ.CANCEL_ORDER('EXT');
        assert.equal(length, 0);

        let order5 = TQ.INSERT_ORDER({
            symbol,
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2100,
            unit_id: "abc",
        });
        let order6 = TQ.INSERT_ORDER({
            symbol,
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2100,
            unit_id: "abc",
        });

        var length = TQ.CANCEL_ORDER('abc');
        assert.equal(length, 2);

        for (var i=0; i<2; i++){
            let send_obj = TQ.ws.send_objs.pop();
            assert.equal(send_obj.aid, 'cancel_order');
        }
    });
});
