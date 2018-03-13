
const DM = (function () {

    function mergeObject(target, source, deleteNullObj) {
        for (let key in source) {
            let value = source[key];
            switch (typeof value) {
                case 'object':
                    if (value === null) {
                        // 服务器 要求 删除对象
                        if (deleteNullObj) { delete target[key]; }
                        else { target[key] = null; }
                    } else if (Array.isArray(value)) {
                        target[key] = target[key] ? target[key] : [];
                        mergeObject(target[key], value, deleteNullObj);
                    } else {
                        target[key] = target[key] ? target[key] : {};
                        mergeObject(target[key], value, deleteNullObj);
                    }
                    break;
                case 'string':
                    if (value === 'NaN') {
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

    function updateData(diff_list, from = 'server') {
        var diff_object = diff_list;
        if (diff_list instanceof Array) {
            diff_object = diff_list[0];
            for (var i = 1; i < diff_list.length; i++) {
                mergeObject(diff_object, diff_list[i], false);
            }
        }
        if (from === 'server') {
            // 只有从服务器更新的数据包，更新 last_changed_data 字段
            for (var k in DM.last_changed_data) delete DM.last_changed_data[k];
            Object.assign(DM.last_changed_data, diff_object);
        }
        mergeObject(DM.datas, diff_object, true)
        return;
    }

    function getTdataObj(insId, instanceId) {
        var path = insId + '.0';
        G_INSTANCES[instanceId].addRelationship(path);
        try {
            return DM.datas.ticks[insId].data;
        } catch (e) {
            return undefined;
        }
    }

    function getKdataObj(insId, durId) {
        try {
            return DM.datas.klines[insId][durId].data;
        } catch (e) {
            return undefined;
        }
    }

    function clearData() {
        // 清空数据
        for (var k in DM.datas) delete DM.datas[k];
    }

    function getAccountId() {
        if (DM.datas.trade) {
            var keys = Object.keys(DM.datas.trade);
            // 只取唯一一个key
            return keys.length > 0 ? keys[0] : undefined;
        }
        return undefined;
    }

    function getData(path, originData = DM.datas) {
        try {
            if (typeof path === 'string') {
                var pathList = path.split('/');
                for (var i = 0; i < pathList.length; i++) originData = originData[pathList[i]];
                return originData;
            }
            else return undefined;
        } catch (e) {
            return undefined;
        }
    }

    return {
        datas: {},
        last_changed_data: {},
        get_tdata_obj: getTdataObj,
        get_kdata_obj: getKdataObj,
        // 更新数据
        update_data: updateData,
        // 清空全部数据
        clear_data: clearData,
        get_data: getData,
        get_account_id: getAccountId
    };
}());
