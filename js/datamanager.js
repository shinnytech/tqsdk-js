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

    function dm_get_data(ins_id, dur_id, data_id, serial_selector){
        if (DM.datas
            && DM.datas.klines
            && DM.datas.klines[ins_id]
            && DM.datas.klines[ins_id][dur_id]
            && DM.datas.klines[ins_id][dur_id].data
            && DM.datas.klines[ins_id][dur_id].data[data_id]
            && DM.datas.klines[ins_id][dur_id].data[data_id][serial_selector]
        ) {
            return DM.datas.klines[ins_id][dur_id].data[data_id][serial_selector];
        } else {
            return NaN;
        }
    }

    function set_invalid_by_prefix(perfix, diff) {
        for (var instance_id in DM.instances_map) {
            var instance = DM.instances_map[instance_id];
            if (!instance.invalid) {
                for (var i = 0; i < instance.rel.length; i++) {
                    if (instance.rel[i].includes(perfix)) {
                        var list = instance.rel[i].split('.');
                        var serial_selector = list.pop();
                        var dur_id = list.pop();
                        var ins_id = list.pop();
                        for (var data_id in diff.klines[ins_id][dur_id].data) {
                            if (data_id > instance.right_id) {
                                instance.invalid = true;
                                break;
                            } else {
                                var old_d = dm_get_data(ins_id, dur_id, data_id, serial_selector);
                                var new_d = diff.klines[ins_id][dur_id].data[data_id][serial_selector];
                                if(old_d != new_d){
                                    instance.invalid = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (instance.invalid) {
                        break;
                    }
                }
            }
        }
    }

    function dm_update_data(diff) {
        // 将 diff 中所有数据涉及的 instance 设置 invalid 标志
        // 只检查了 klines ins_id dur_id 里的数据
        if (diff.klines) {
            for (var key in diff.klines) {
                for (var dur in diff.klines[key]) {
                    var perfix = key + '.' + dur;
                    set_invalid_by_prefix(perfix, diff);
                }
            }
            // 重新计算 instance
            dm_recalculate();
        }
        // 将 diff 中所有数据更新到 datas 中
        merge_object(DM.datas, diff);
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
                invalid: false,
                left_id: undefined,
                right_id: undefined
            }
        }
        var path = ins_id + '.' + dur_id + '.' + serial_selector;
        if (DM.instances_map[instance_id]['rel'].indexOf(path) == -1) {
            DM.instances_map[instance_id]['rel'].push(path);
        }
        // 返回数据
        return dm_get_data(ins_id, dur_id, data_id, serial_selector);
    }

    function dm_get_k_range(ins_id, dur_id, instance_id) {
        console.log('dm_get_k_range')
        // 记录实例依赖关系
        if (!DM.instances_map[instance_id]) {
            DM.instances_map[instance_id] = {
                rel: [],
                invalid: false,
                left_id: undefined,
                right_id: undefined
            }
        }
        // 返回数据
        var d = DM.datas;
        if (d && d.klines && d.klines[ins_id] && d.klines[ins_id][dur_id] && d.klines[ins_id][dur_id].data) {
            var res = d.klines[ins_id][dur_id].data;
            var sorted_keys = Object.keys(res).sort();
            if (DM.instances_map[instance_id].left_id == undefined || DM.instances_map[instance_id].right_id == undefined) {
                DM.instances_map[instance_id].left_id = sorted_keys[0];
            } else {
                DM.instances_map[instance_id].left_id = DM.instances_map[instance_id].right_id;
            }
            DM.instances_map[instance_id].right_id = sorted_keys[sorted_keys.length - 1];
            return [DM.instances_map[instance_id].left_id, DM.instances_map[instance_id].right_id];
        } else {
            return undefined;
        }
    }

    function dm_reset_kdata_range(instance_id) {
        if (!DM.instances_map[instance_id]) {
            DM.instances_map[instance_id] = {
                rel: [],
                invalid: false,
                left_id: undefined,
                right_id: undefined
            }
        } else {
            DM.instances_map[instance_id].rel = [];
            DM.instances_map[instance_id].invalid= false,
            // reset_kdata_range
            DM.instances_map[instance_id].left_id = undefined;
            DM.instances_map[instance_id].right_id = undefined;
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
        reset_indicator_instance: dm_reset_kdata_range,
        update_data: dm_update_data,
        clear_data: dm_clear_data
    }
}();
