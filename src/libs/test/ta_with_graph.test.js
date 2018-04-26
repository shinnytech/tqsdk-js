var assert = require('assert');
var {init_test_data, batch_input_datas, MockWebsocket} = require('./test_data.js');
var importScripts = require('./importScripts.js');
importScripts('src/libs/func/basefuncs.js', 'src/libs/tqsdk.js', 'src/libs/ind/ma.js', 'src/libs/ind/voi.js');

var TQ = new TQSDK(new MockWebsocket());
init_test_data(TQ);
let symbol = "CFFEX.IF1801";

describe('技术指标与图表结合使用', function () {
    TQ.REGISTER_INDICATOR_CLASS(ma);
    TQ.REGISTER_INDICATOR_CLASS(voi);
    batch_input_datas({TQ, symbol, dur:5, left_id:1000, right_id:3000, last_id:3000});

    it('常规流程', function () {
        //请求创建指标实例
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 2800,
            "view_right": 4000,
            "params": {
                "N1": {"value": 10},
                "N2": {"value": 20},
                "N3": {"value": 30},
                "N4": {"value": 40},
            }
        };
        TQ.on_update_indicator_instance(r);
        //预期将向主程序发送一个 set_indicator_data 包, 检查这个包的内容
        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.aid, "set_indicator_data");
        assert.equal(send_obj.instance_id, "abc324238");
        assert.equal(send_obj.epoch, 1);
        assert.equal(send_obj.range_left, 2800);
        assert.equal(send_obj.range_right, 3000);
        assert.equal(send_obj.datas.ma10[0].length, 201);
        assert(!isNaN(send_obj.datas.ma10[0][0]));
        assert.equal(send_obj.datas.ma10[0][10], 2805.5);
        assert.equal(send_obj.datas.ma10[0][200], 2995.5);

        //更新一波行情数据
        //预期会向主程序发送 set_indicator_data 包, 增补前次未发送的数据
        batch_input_datas({TQ, symbol, dur:5, left_id:3001, right_id:3001, last_id:3001});
        let send_obj_2 = TQ.ws.send_objs.pop();
        assert.equal(send_obj_2.range_left, 3000);
        assert.equal(send_obj_2.range_right, 3001);
        assert.equal(send_obj_2.datas.ma10[0][1], 2996.5);
    });

    it('更新指标参数(只调整 view_left和 view_right)', function () {
        //预期会向主程序发送 set_indicator_data 包, 增补前次未发送的数据
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 2600,
            "view_right": 4000,
            "params": {
                "N1": {"value": 10},
                "N2": {"value": 20},
                "N3": {"value": 30},
                "N4": {"value": 40},
            }
        };
        TQ.on_update_indicator_instance(r);

        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.range_left, 2600);
        assert.equal(send_obj.range_right, 3001);
        assert.equal(send_obj.datas.ma10[0][0], 2595.5);
    });

    it('更新指标参数(缩放)', function () {
        //预期会向主程序发送 set_indicator_data 包, 增补前次未发送的数据
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 2600,
            "view_right": 4000,
            "params": {
                "N1": {"value": 10},
                "N2": {"value": 20},
                "N3": {"value": 30},
                "N4": {"value": 40},
            }
        };
        TQ.on_update_indicator_instance(r);

        let r1 = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 1000,
            "view_right": 4000,
            "params": {
                "N1": {"value": 10},
                "N2": {"value": 20},
                "N3": {"value": 30},
                "N4": {"value": 40},
            }
        };
        TQ.on_update_indicator_instance(r1);

        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.range_left, 1000);
        assert.equal(send_obj.range_right, 3001);
        assert.ok(isNaN(send_obj.datas.ma10[0][0]));
        assert.ok(isNaN(send_obj.datas.ma10[0][8]));
        assert.equal(send_obj.datas.ma10[0][9], 1004.5);
    });

    it('更新指标参数(HOME && END)', function () {
        //预期会向主程序发送 set_indicator_data 包, 增补前次未发送的数据
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 2600,
            "view_right": 4000,
            "params": {
                "N1": {"value": 10},
                "N2": {"value": 20},
                "N3": {"value": 30},
                "N4": {"value": 40},
            }
        };
        TQ.on_update_indicator_instance(r);

        let r1 = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 0,
            "view_right": 400,
            "params": {
                "N1": {"value": 10},
                "N2": {"value": 20},
                "N3": {"value": 30},
                "N4": {"value": 40},
            }
        };
        TQ.on_update_indicator_instance(r1);

        let send_obj = TQ.ws.send_objs.pop();
        console.log(send_obj)
        assert.equal(send_obj.range_left, -1);
        assert.equal(send_obj.range_right, -1);
        assert.equal(Object.keys(send_obj.datas).length, 0);

        batch_input_datas({TQ, symbol, dur:5, left_id:0, right_id:400, last_id:3005});

        let send_obj1 = TQ.ws.send_objs.pop();
        assert.equal(send_obj1.range_left, 0);
        assert.equal(send_obj1.range_right, 400);
        assert.ok(isNaN(send_obj1.datas.ma10[0][0]));
        assert.ok(isNaN(send_obj1.datas.ma10[0][8]));
        assert.equal(send_obj1.datas.ma10[0][9], 4.5);
    });

    it('更新指标参数(更换合约/周期)', function () {
        //预期会向主程序发送 set_indicator_data 包, 所有数据会重算
        symbol = 'SHFE.rb1801';
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "ma",
            "instance_id": "abc324238",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 2600,
            "view_right": 4000,
            "params": {
                "N1": {"value": 10},
                "N2": {"value": 20},
                "N3": {"value": 30},
                "N4": {"value": 40},
            }
        };
        TQ.on_update_indicator_instance(r);

        // 数据未更新
        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.range_left, -1);
        assert.equal(send_obj.range_right, -1);

        // 数据更新
        batch_input_datas({TQ, symbol, dur:5, left_id:1000, right_id:3500, last_id:3500});

        let send_obj_1 = TQ.ws.send_objs.pop();
        assert.equal(send_obj_1.range_left, 2600);
        assert.equal(send_obj_1.range_right, 3500);
        assert.equal(send_obj_1.datas.ma10[0][0], 2595.5);

    });

    it('更新指标 voi', function () {
        //预期会向主程序发送 set_indicator_data 包, 所有数据会重算
        symbol = 'SHFE.rb1801';
        let r = {
            "aid": "update_indicator_instance",
            "ta_class_name": "voi",
            "instance_id": "abc123456",
            "epoch": 1,
            "ins_id": symbol,
            "dur_nano": 5000000000,
            "view_left": 2800,
            "view_right": 4000,
            "params": {}
        };
        TQ.on_update_indicator_instance(r);

        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.aid, "set_indicator_data");
        assert.equal(send_obj.instance_id, "abc123456");
        assert.equal(send_obj.epoch, 1);
        assert.equal(send_obj.range_left, 2800);
        assert.equal(send_obj.range_right, 3500);
        assert.equal(send_obj.datas.vol[0].length, 701);
        assert.equal(send_obj.datas.vol[0][10], 2810);
        assert.equal(send_obj.datas.vol[0][200], 3000);

    });
});

