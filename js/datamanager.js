var DM = function () {
    function merge_object(target, source) {
        for (var property in source) {
            if (source.hasOwnProperty(property)) {
                var sourceProperty = source[property];
                if (typeof sourceProperty === 'object' && target.hasOwnProperty(property)) {
                    if (sourceProperty === null) {
                        // typeof null === 'object' 表示不存在
                        target[property] = sourceProperty;
                    }
                    target[property] = merge_object(target[property], sourceProperty);
                } else {
                    target[property] = sourceProperty;
                }
            }
        }
        return target;
    }

    function set_invalid(p) {
        for (var instance_id in DM.instances_map) {
            var instance = DM.instances_map[instance_id];
            if (!instance.invalid && instance.rel.indexOf(p) > -1) {
                instance.invalid = true;
                continue;
            }
        }
    }

    function dm_update_data(diff) {
        // 将 diff 中所有数据更新到 datas 中
        merge_object(DM.datas, diff);
        // 将 diff 中所有数据涉及的 instance 设置 invalid 标志
        // 只检查了 klines ins_id dur_id 里的数据
        if (diff.klines) {
            for (var key in diff.klines) {
                for (var dur in diff.klines[key]) {
                    var p = key + '.' + dur;
                    set_invalid(p);
                }
            }
        }
        // 重新计算 instance
        dm_recalculate();
    }

    function dm_recalculate() {
        for (var instance_id in DM.instances_map) {
            if (DM.instances_map[instance_id].invalid) {
                DM.instances_map[instance_id].invalid = false;
                TM.recalc_indicator_by_id(instance_id);
            }
        }
    }

    function dm_get_kdata(ins_id, dur_id, data_id, serial_selector, instance_id) {
        // 记录实例依赖关系
        if (!DM.instances_map[instance_id]) {
            DM.instances_map[instance_id] = {
                rel: [],
                invalid: false
            }
        }
        var path = ins_id + '.' + dur_id;
        if (DM.instances_map[instance_id]['rel'].indexOf(path) == -1) {
            DM.instances_map[instance_id]['rel'].push(path);
        }
        // 返回数据
        var d = DM.datas;
        if (d && d.klines && d.klines[ins_id] && d.klines[ins_id][dur_id] && d.klines[ins_id][dur_id].data) {
            var res = d.klines[ins_id][dur_id].data;
            if (res[data_id]) return res[data_id][serial_selector];
            else return NaN;
        } else {
            return NaN;
        }
    }

    function dm_get_k_range(ins_id, dur_id) {
        var d = DM.datas;
        if (d && d.klines && d.klines[ins_id] && d.klines[ins_id][dur_id] && d.klines[ins_id][dur_id].data) {
            var res = d.klines[ins_id][dur_id].data;
            var sorted_keys = Object.keys(res).sort();
            return [sorted_keys[0], sorted_keys[sorted_keys.length - 1]];
        } else {
            return undefined;
        }
    }

    function dm_clear_data() {
        // 清空数据
        DM.instances_map = {};
        DM.datas = {};
    }

    return {
        instances_map: {},
        datas: {},
        get_kdata: dm_get_kdata,
        get_kdata_range: dm_get_k_range,
        update_data: dm_update_data,
        clear_data: dm_clear_data
    }
}();
