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
// batch_input_datas({TQ, symbol, dur:5, left_id:1000, right_id:3000, last_id:3000});

class IndOrder extends Indicator {
    static define() {
        return {
            type: "MAIN",
            cname: "indOrder",
            state: "KLINE",
            params: [
                {name: "N", default: 3},
            ],
        };
    }
    init(){
    }
    calc(i) {
        this.ORDER(i, "SELL", "CLOSEOPEN", 1);
    }
}

TQ.REGISTER_INDICATOR_CLASS(IndOrder);

describe('指标中下单', function () {

    it('常规流程', function () {
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
