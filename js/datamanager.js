var DM = function () {
    function merge_object(target, source) {
        for (var key in source) {
            var value = source[key];
            switch (typeof value) {
                case 'object':
                    if (value == null) {
                        target[key] = value;
                    } else if (Array.isArray(value)) {
                        target[key] = target[key] ? target[key] : [];
                        merge_object(target[key], value);
                    } else {
                        target[key] = target[key] ? target[key] : {};
                        merge_object(target[key], value);
                    }
                    break;
                case 'string':
                    if (value == 'NaN') {
                        target[key] = NaN;
                    } else {
                        target[key] = value;
                    }
                    break;
                case 'boolean':
                case 'number':
                    target[key] = value;
                    break;
                case 'undefined':
                    break;
            }
        }
    }

    function set_invalid(diff) {
        if (diff.klines) {
            for (var key in diff.klines) {
                for (var dur in diff.klines[key]) {
                    var perfix = key + '.' + dur;
                    // set_invalid
                    for (var instance_id in G_Instances) {
                        G_Instances[instance_id].setInvalidByPath(perfix);
                    }
                    // 更新 path 对应的 first_id, last_id
                    if (!DM.paths.has(perfix)) {
                        DM.paths.set(perfix, [Infinity, -Infinity]);
                    }
                    var [first_id, last_id] = DM.paths.get(perfix);
                    for (var k in diff.klines[key][dur]['data']) {
                        first_id = first_id < parseInt(k) ? first_id : parseInt(k);
                        last_id = last_id > parseInt(k) ? last_id : parseInt(k);
                    }
                    DM.paths.get(perfix)[0] = first_id;
                    DM.paths.get(perfix)[1] = last_id;
                }
            }
        }
    }

    function dm_update_data(diff) {
        // 将 diff 中所有数据更新到 datas 中
        merge_object(DM.datas, diff);
        // 将 diff 中所有数据涉及的 instance 设置 invalid 标志
        // 只检查了 klines ins_id dur_id 里的数据
        set_invalid(diff);
    }

    function dm_get_tdata_obj(ins_id, instance_id) {
        var path = ins_id + '.0';
        G_Instances[instance_id].addRelationship(path);
        try {
            return DM.datas.ticks[ins_id].data;
        } catch (e) {
            return undefined;
        }
    }

    function dm_get_kdata_obj(ins_id, dur_id, instance_id) {
        var path = ins_id + '.' + dur_id;
        G_Instances[instance_id].addRelationship(path);
        try {
            return DM.datas.klines[ins_id][dur_id].data;
        } catch (e) {
            return undefined;
        }
    }

    function dm_clear_data() {
        // 清空数据
        DM.datas = {};
        DM.paths = new Map();
    }

    function dm_get_data_range(path){
        var res = [Infinity, -Infinity];
        if (DM.paths.has(path)) {
            res = DM.paths.get(path);
        }
        return res;
    }

    return {
        datas: {},
        paths: new Map(),
        get_tdata_obj: dm_get_tdata_obj,
        get_kdata_obj: dm_get_kdata_obj,
        get_data_range: dm_get_data_range,
        update_data: dm_update_data,
        clear_data: dm_clear_data
    }
}();
