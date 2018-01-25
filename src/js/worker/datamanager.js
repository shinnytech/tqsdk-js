
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

    function updateData(diff_list) {
        var diff_object = diff_list;
        if (diff_list instanceof Array) {
            diff_object = diff_list[0];
            for (var i = 1; i < diff_list.length; i++) {
                mergeObject(diff_object, diff_list[i], false);
            }
        }
        DM.last_changed_data = diff_object;
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

    function getDataFromTrade(path) {
        var accountId = getAccountId();
        if (accountId) return getData('trade.' + accountId + '.' + path, '.');
        return undefined;
    }

    function getData(path, separator) {
        try {
            var d = DM.datas;
            var pathList = null;
            if (path instanceof Array) pathList = path;
            else if (typeof path === 'string') pathList = path.split(separator ? separator : ' ');
            else return undefined;
            for (var i = 0; i < pathList.length; i++) d = d[pathList[i]];
            return d;
        } catch (e) {
            return undefined;
        }
    }

    return {
        account_id: undefined,
        datas: {},
        last_changed_data: {},
        get_tdata_obj: getTdataObj,
        get_kdata_obj: getKdataObj,
        // 更新数据
        update_data: updateData,
        // 清空全部数据
        clear_data: clearData,
        get_data: getData,

        // TODO: 怎么选择某个帐户
        get_account_id: getAccountId,
        get_account: function () {
            return getDataFromTrade('accounts.CNY');
        },
        get_positions: function () {
            return getDataFromTrade('positions');
        },
        get_session: function () {
            return getDataFromTrade('session');
        },
        get_order: function (id) {
            return getDataFromTrade('orders.' + id);
        },
        get_quote: function (id) {
            // 订阅行情
            var ins_list = DM.datas.ins_list;
            if (ins_list && !ins_list.includes(id)) {
                id = (ins_list.substr(-1, 1) === ',') ? id : (',' + id);
                var s = ins_list + id;
                WS.sendJson({
                    aid: "subscribe_quote",
                    ins_list: s
                });
            }
            return DM.datas.quotes[id];
        },
        get_combine: function (name) {
            if (DM.datas.combines && DM.datas.combines['USER.' + name])
                return DM.datas.combines['USER.' + name];
            return undefined;
        }
    };
}());
