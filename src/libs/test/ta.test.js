var assert = require('assert');
var {init_test_data, batch_input_datas, MockWebsocket} = require('./test_data.js');
var importScripts = require('./importScripts.js');
importScripts('src/libs/func/basefuncs.js', 'src/libs/tqsdk.js', 'src/libs/ind/ma.js');

var TQ = new TQSDK(new MockWebsocket());

init_test_data(TQ);
batch_input_datas({TQ, symbol: 'SHFE.rb1810', dur:5, left_id:1000, right_id:10000, last_id:10000});

describe('ta', function () {
    it('定义指标', function () {
        TQ.REGISTER_INDICATOR_CLASS(ma);
        assert.equal(TQ.ws.send_objs.length, 1);
        let send_obj = TQ.ws.send_objs[0];
        assert.equal(send_obj.aid, "register_indicator_class");
        assert.equal(send_obj.name, "ma");
        assert.equal(send_obj.type, "MAIN");
        assert.equal(send_obj.params.length, 4);
    });

    it('指标简单计算 - 全部默认参数', function () {
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let ind1 = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec, {});
        let send_obj = TQ.ws.send_objs[0];
        assert.equal(ind1.outs.ma3(-1), 9999);
        assert.equal(ind1.outs.ma5(-1), 9998); // N2 默认参数 10
        assert.equal(ind1.outs.ma10(-1), 9995.5); // N2 默认参数 30
        assert.equal(ind1.outs.ma20(-1), 9990.5); // N2 默认参数 60
    });

    it('指标简单计算 - 部分默认参数', function () {
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let ind1 = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec, {
            N1: 1
        });
        assert.equal(ind1.outs.ma1(-1), 10000);
        assert.equal(ind1.outs.ma5(-1), 9998);
    });

    it('指标简单计算 - 客户端填入全部参数', function () {
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let ind1 = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec, {
            N1: 1,
            N2: 3,
            N3: 5,
            N4: 7
        });
        assert.equal(ind1.outs.ma1(-1), 10000);
        assert.equal(ind1.outs.ma3(-1), 9999);
        assert.equal(ind1.outs.ma5(-1), 9998);
        assert.equal(ind1.outs.ma7(-1), 9997);
    });

    it('更新指标计算范围', function () {
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let params = {
            N1: 1,
            N2: 3,
            N3: 5,
            N4: 7
        };
        let ind = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec, params);
        let outs_data1 = ind.outs.ma1(1000, 1010);
        let outs_data2 = ind.outs.ma3(1000, 1010);

        assert.equal(outs_data1.length, 11);
        assert.equal(outs_data1[4], 1004);
        assert.equal(outs_data1[10], 1010);

        assert.equal(outs_data2.length, 11);
        assert.ok(isNaN(outs_data2[0]));
        assert.ok(isNaN(outs_data2[1]));
        assert.equal(outs_data2[2], 1001);
        assert.equal(outs_data2[10], 1009);

        let outs_data3 = ind.outs.ma5(9990, 10000);

        assert.equal(outs_data3.length, 11);
        assert.equal(outs_data3[0], 9988);
        assert.equal(outs_data3[4], 9992);
        assert.equal(outs_data3[10], 9998);

    });

    it('指标简单计算 - 取没有 klines 数据的范围', function () {
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let ind = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec);
        let outs_data = ind.outs.ma10(100, 110);
        assert.equal(outs_data.length, 11);
        assert.ok(isNaN(outs_data[0]));
        assert.ok(isNaN(outs_data[10]));

        batch_input_datas({TQ, symbol: 'SHFE.rb1810', dur:5, left_id:1000, right_id:1000, last_id:11000});
        let outs_data2 = ind.outs.ma5(10000, 10010);
        assert.equal(outs_data2.length, 11);
        assert.equal(outs_data2[0], 9998);
        assert.ok(isNaN(outs_data2[1]));
        assert.ok(isNaN(outs_data2[10]));

    });

    it('删除指标实例', function(){
        let symbol = "SHFE.rb1810";
        let dur_sec = 5;
        let params = {
            N1: 1,
            N2: 3,
            N3: 5,
            N4: 7
        };
        let ind = TQ.NEW_INDICATOR_INSTANCE(ma, symbol, dur_sec, params);
        assert.ok(TQ.ta.instance_dict[ind.instance_id]);
        TQ.DELETE_INDICATOR_INSTANCE(ind);
        assert.equal(TQ.ta.instance_dict[ind.instance_id], undefined);
    });

    it('删除指标类', function () {
        assert.ok(TQ.ta.class_dict["ma"]);
        TQ.UNREGISTER_INDICATOR_CLASS('ma');
        //todo 参数变了，是否发动数据包
        assert.equal(TQ.ta.class_dict["ma"], undefined);
        let send_obj = TQ.ws.send_objs.pop();
        assert.equal(send_obj.aid, "unregister_indicator_class");
        assert.equal(send_obj.name, "ma");

    });
});

