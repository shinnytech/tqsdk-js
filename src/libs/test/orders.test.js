var assert = require('assert');
var {init_test_data, batch_input_datas} = require('./test_data.js');
var importScripts = require('./importScripts.js');
importScripts('src/libs/func/basefuncs.js', 'src/libs/tqsdk.js');


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
let symbol = "CFFEX.IF1801";

let order_ids = [];


describe('下单', function () {
    it('单个函数', function () {
        //下单
        let order1 = TQ.INSERT_ORDER({
            symbol,
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2000,
            prefix: "abc",
        });

        assert.ok(order1.order_id.includes(TQ.id));
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
            prefix: "abc",
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

    it('批量获取订单', function () {
        //下单
        let order3 = TQ.INSERT_ORDER({
            symbol,
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2200,
            prefix: "abc",
        });
        order_ids.push(order3.order_id);
        let order4 = TQ.INSERT_ORDER({
            symbol,
            direction: "BUY",
            offset: "OPEN",
            volume: 2,
            limit_price: 2100,
            prefix: "def",
        });
        order_ids.push(order4.order_id);
        let orders = TQ.GET_ORDER_DICT();
        assert.equal(Object.keys(orders).length, 4);

        let orders_abc = TQ.GET_ORDER_DICT({
            order_id_prefix: 'abc'
        });
        assert.equal(Object.keys(orders_abc).length, 3);

        var orders_def = TQ.GET_ORDER_DICT({
            order_id_prefix: 'def'
        });
        assert.equal(Object.keys(orders_def).length, 1);

    });

    it('统计已发送 order', function () {
        let result = TQ.GET_ORDERS_SUMMARY();
        assert.equal(result.open_buy_volume, 0);
        assert.equal(result.open_buy_price, 0);

        // 模拟成交
        for(var order_id of order_ids){
            TQ.on_rtn_data({
                "aid": "rtn_data",
                "data":[
                    {
                        "trade": {
                            "user1": {
                                "orders": {
                                    [order_id]: {
                                        direction: "BUY",
                                        offset: "OPEN",
                                        volume_left: 0,
                                        status: "FINISHED"
                                    }
                                }
                            }
                        }
                    }]
            });
        }

        let result2 = TQ.GET_ORDERS_SUMMARY();
        assert.equal(result2.open_buy_volume, 6);
        assert.equal(result2.open_buy_price, 2100)
        assert.equal(result2.open_sell_volume, 0);
        assert.equal(result2.open_sell_price, 0);

    });

    it('批量撤单', function () {
        console.log(TQ.ws.send_objs)
        for (var i=0; i<3; i++){
            let send_obj = TQ.ws.send_objs.pop();
            assert.equal(send_obj.aid, 'cancel_order');
        }
    });
});
