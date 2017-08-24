(function () {
    var root_node, current_node;

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
    };

    function iterator_object(key, obj, func) {
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                var t = key + "." + name;
                func(t, obj);
                var value = obj[name];
                if (typeof value === 'object') {
                    iterator_object(t, value, func)
                }
            }
        }
    }

    function dm_init(entry_func) {
        root_node = {
            invalid: false,
            func: null,
            childs: [],
            relations: [],
        }
        current_node = root_node;
        dm_run(entry_func);
    }

    function check_invalid(path, node) {
        if (node.invalid) {
            return;
        }
        if (node.relations.indexOf(path) != -1) {
            node.invalid = true;
            return;
        }
        for (var i = 0; i < node.childs.length; i++) {
            check_invalid(path, node.childs[i]);
        }
        return;
    }

    function dm_update_data(diff, fn) {
        //将diff中所有数据更新到datas中
        merge_object(DM.datas, diff);
        //将diff中所有数据涉及的node设置invalid标志
        iterator_object("", diff, function (path, obj) {
            check_invalid(path, root_node);
        });
        //重绘app
        dm_try_repaint(root_node);
    }

    function dm_try_repaint(node) {
        if (node.invalid == true) {
            node.invalid = false;
            node.childs = [];
            node.relations = [];
            current_node = node;
            node.func();
            return;
        }
        for (var i = 0; i < node.childs.length; i++) {
            dm_try_repaint(node.childs[i]);
        }
    }

    function dm_run(f) {
        //创建一个node
        var node = {
            name: f.name,
            invalid: false,
            func: f,
            childs: [],
            relations: [],
        }
        var prev_node = current_node;
        //将node加入到current_node的child中
        current_node.childs.push(node);
        //current_node 指向node
        current_node = node;
        //运行此node的func
        node.func();
        //current_node 指向node
        current_node = prev_node;
    }

    function dm_get(path) {
        //将current_node和对应数据 加到 node.relations 中
        current_node.relations.push("." + path);
        //取数据
        var keys = path.split(".");
        var d = DM.datas;
        for (var i = 0; i < keys.length; i++) {
            d = d[keys[i]]
            if (d == undefined)
                return undefined;
        }
        return d;
    }

    function dm_get_kdata(ins_id, dur_id, data_id, serial_selector){
        // console.log("dm_get_kdata" + ins_id + dur_id + data_id + serial_selector);
        var d = DM.datas.klines[ins_id];
        if (d === undefined){
            console.log("1");
            return NaN;
        }
        d = d[dur_id];
        if (d === undefined){
            console.log("2");
            return NaN;
        }
        d = d["data"];
        if (d === undefined){
            console.log("3");
            return NaN;
        }
        d = d[data_id];
        if (d === undefined){
            console.log("4");
            return NaN;
        }
        d = d[serial_selector];
        return d;
    }

    function dm_get_k_range(ins_id, dur_id){
        var d = DM.datas;
        d = d.klines;
        if (d === undefined){
            console.log("dm_get_k_range.0:" + JSON.stringify(DM.datas));
            return undefined;
        }
        d = d[ins_id];
        if (d === undefined){
            console.log("dm_get_k_range.1:" + ins_id);
            return undefined;
        }
        d = d[dur_id];
        if (d === undefined){
            console.log("dm_get_k_range.2" + dur_id);
            return undefined;
        }
        d = d.data;
        if (d === undefined){
            console.log("dm_get_k_range.3");
            return undefined;
        }
        var sorted_keys = Object.keys(d).sort();
        return [sorted_keys[0], sorted_keys[sorted_keys.length - 1]];
    }
    function dm_clear_data() {
        // 清空数据
        console.log("dm_clear_data");
        var state = DM.datas.state;
        DM.datas = { state: state };
    }

    this.DM = {
        datas: { 'state': {} },
        init: dm_init,
        run: dm_run,
        get_data: dm_get,
        get_kdata: dm_get_kdata,
        get_kdata_range: dm_get_k_range,
        update_data: dm_update_data,
        clear_data: dm_clear_data
    }
}());
