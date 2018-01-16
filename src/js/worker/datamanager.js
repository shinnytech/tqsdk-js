
const DM = (function () {

    function mergeObject(target, source) {
        let result = [];
        for (let key in source) {
            let value = source[key];
            switch (typeof value) {
                case 'object':
                    var tempRes = [];
                    if (value === null) {
                        target[key] = value;
                        tempRes = [target[key]]
                    } else if (Array.isArray(value)) {
                        target[key] = target[key] ? target[key] : [];
                        tempRes = mergeObject(target[key], value);
                    } else {
                        target[key] = target[key] ? target[key] : {};
                        tempRes = mergeObject(target[key], value);
                    }
                    result.push(target[key])
                    result = result.concat(tempRes);
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
        return result;
    }

    function setInvalid(diff) {
        if (diff.klines) {
            for (let key in diff.klines) {
                for (let dur in diff.klines[key]) {
                    let perfix = key + '.' + dur;

                    // 更新 path 对应的 first_id, last_id
                    if (!DM.paths.has(perfix)) {
                        DM.paths.set(perfix, { firstId: Infinity, lastId: -Infinity });
                    }

                    let { firstId, lastId } = DM.paths.get(perfix);
                    for (let k in diff.klines[key][dur].data) {
                        firstId = firstId < parseInt(k) ? firstId : parseInt(k);
                        lastId = lastId > parseInt(k) ? lastId : parseInt(k);
                    }

                    DM.paths.get(perfix).firstId = firstId;
                    DM.paths.get(perfix).lastId = lastId;
                }
            }
        }
    }

    function updateData(diff) {
        // 将 diff 中所有数据更新到 datas 中
        var changeObjList = mergeObject(DM.datas, diff);

        // 将 diff 中所有数据涉及的 instance 设置 invalid 标志
        // 只检查了 klines[ins_id][dur_id] 里的数据
        setInvalid(diff);
        return changeObjList; // 返回 diff 中所有对象组成的列表
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

    function getKdataObj(insId, durId, instanceId) {
        try {
            return DM.datas.klines[insId][durId].data;
        } catch (e) {
            return undefined;
        }
    }

    function clearData() {
        // 清空数据
        for (var k in DM.datas) delete DM.datas[k];
        DM.paths.clear();
    }

    function getDataRange(path) {
        var res = { firstId: Infinity, lastId: -Infinity };
        if (DM.paths.has(path)) res = DM.paths.get(path);
        return res;
    }

    function getAccountId() {
        if (DM.datas.trade) {
            var keys = Object.keys(DM.datas.trade);
            // todo： 只取唯一一个key
            // return keys.length > 0 ? keys[0] : undefined;
            /************ 临时方案 过滤掉 0 */
            for (var k in keys){
                if (keys[k] == 0) continue;
                return keys[k];
            }
            /************ */
        }
        return undefined;
    }

    function getDataFromTrade(path){
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
        paths: new Map(),
        get_tdata_obj: getTdataObj,
        get_kdata_obj: getKdataObj,
        get_data_range: getDataRange,
        // 更新数据
        update_data: updateData,
        // 清空全部数据
        clear_data: clearData,
        get_data: getData,

        // TODO: 怎么选择某个帐户
        get_account_id: getAccountId ,
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
