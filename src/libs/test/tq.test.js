var assert = require('assert');
var {init_test_data, batch_input_datas, MockWebsocket} = require('./test_data.js');
var importScripts = require('./importScripts.js');
importScripts('src/libs/func/basefuncs.js', 'src/libs/tqsdk.js');

var TQ = new TQSDK(new MockWebsocket());
init_test_data(TQ);

let symbol = "CFFEX.IF1801";
batch_input_datas({TQ, symbol, dur:5, left_id:1000, right_id:3000, last_id:3000});


function* mat(C){
    //指标定义
    C.DEFINE({
        type: "MAIN",
        cname: "下单指标",
        state: "KLINE",
    });
    //参数
    let n1 = C.PARAM(3, "N1");  //短均线周期
    let n2 = C.PARAM(10, "N2"); //长均线周期
    //输出序列
    let m1 = C.OUTS("LINE", "ma" + n1, {color: RED});
    let m2 = C.OUTS("LINE", "ma" + n2, {color: GREEN});
    //计算
    while(true) {
        let i = yield;
        m1[i] = MA(i, C.DS.close, n1, m1);  //计算短均线值
        m2[i] = MA(i, C.DS.close, n2, m2);  //计算长均线值
        if (m1[i] > m2[i] && m1[i-1] <= m2[i-1])  //短均线上穿长均线，买进
            C.ORDER("BUY", "CLOSEOPEN", 1);
        if (m1[i] < m2[i] && m1[i-1] >= m2[i-1])  //短均线下穿长均线，卖出
            C.ORDER("SELL", "CLOSEOPEN", 1);
    }
}

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
