/**
 * 返回array的一个proxy，以支持负数下标，并可选的为每个数据项提供一个读取转换函数
 * @param data_array
 * @param item_func
 * @returns {Proxy}
 */
function make_array_proxy(data_array, item_func=undefined){
    let handler = {
        get: function (target, property, receiver) {
            if (!isNaN(property)) {
                let i = Number(property);
                if (i < 0)
                    return NaN;
                // i = target.length + i;
                if (item_func)
                    return item_func(data_array[i]);
                else
                    return data_array[i];
            } else{
                return target[property];
            }
        }
    };
    let p = new Proxy(data_array, handler);
    return p;
}

class DataManager{
    constructor(){
        this.account_id = "";
        this.datas = {};
        this.epoch = 0;
    }

    mergeObject(target, source, deleteNullObj) {
        for (let key in source) {
            let value = source[key];
            switch (typeof value) {
                case 'object':
                    if (value === null) {
                        // 服务器 要求 删除对象
                        if (deleteNullObj) {
                            delete target[key];
                        } else {
                            target[key] = null;
                        }
                    } else if (Array.isArray(value)) {
                        target[key] = target[key] ? target[key] : [];
                        this.mergeObject(target[key], value, deleteNullObj);
                    } else if (key == "data"){
                        //@note: 这里做了一个特例, 使得K线序列数据被保存为一个array, 而非object, 并且记录整个array首个有效记录的id
                        if (!(key in target))
                            target.data = [];
                        if (target.left_id == undefined || isNaN(target.left_id) || Object.keys(value)[0] < target.left_id)
                            target.left_id = Number(Object.keys(value)[0]);
                        // @note: 后面使用 GET_KLINE 返回的是 target.data 的 proxy，这样可以方便取得 last_id
                        target.data.last_id = target.last_id;
                        this.mergeObject(target[key], value, deleteNullObj);
                    } else if (key == "units"){
                        //@note: 不再接收主程序推送的unit相关数据, 改为sdk内部自行计算
                    } else {
                        target[key] = target[key] ? target[key] : {};
                        this.mergeObject(target[key], value, deleteNullObj);
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
        target["_epoch"] = this.epoch;
    }

    is_changing(obj){
        return obj && obj._epoch ? obj._epoch == this.epoch : false;
    }

    get_tdata_obj(insId, instanceId) {
        var path = insId + '.0';
        try {
            return this.datas.ticks[insId].data;
        } catch (e) {
            return undefined;
        }
    }

    clear_data() {
        this.datas = {};
    }

    /**
     * 收到aid=="rtn_data"的数据包时, 由本函数处理
     * @param message_rtn_data
     */
    on_rtn_data(message_rtn_data) {
        //收到行情数据包，更新到数据存储区
        this.epoch += 1;
        for (let i = 0; i < message_rtn_data.data.length; i++) {
            let d = message_rtn_data.data[i];
            if (!this.account_id && d.trade){
                this.account_id = Object.keys(d.trade)[0];
            }
            this.mergeObject(this.datas, d, true);
        }
    }

    set_default(default_value, ...path){
        let node = this.datas;
        for (let i = 0; i < path.length; i++) {
            if (! (path[i] in node))
                if (i+1 == path.length)
                    node[path[i]] = default_value;
                else
                    node[path[i]] = {};
            node = node[path[i]];
        }
        return node;
    }

    get(...path){
        let node = this.datas;
        for (let i = 0; i < path.length; i++) {
            if (! (path[i] in node))
                return undefined;
            node = node[path[i]];
        }
        return node;
    }

    /**
     * 获取 k线序列
     */
    get_kline_serial(symbol, dur_nano) {
        let ks = this.set_default({last_id: -1, data:[]}, "klines", symbol, dur_nano);
        if (! ks.d){
            ks.d = make_array_proxy(ks.data);
            ks.d.open = make_array_proxy(ks.data, k => k?k.open:undefined);
            ks.d.high = make_array_proxy(ks.data, k => k?k.high:undefined);
            ks.d.low = make_array_proxy(ks.data, k => k?k.low:undefined);
            ks.d.close = make_array_proxy(ks.data, k => k?k.close:undefined);
            ks.d.volume = make_array_proxy(ks.data, k => k?k.volume:undefined);
            ks.d.close_oi = make_array_proxy(ks.data, k => k?k.close_oi:undefined);
            ks.d.open_oi = make_array_proxy(ks.data, k => k?k.open_oi:undefined);
        }
        return ks;
    }
}
