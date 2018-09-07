class TQSDK {
    constructor(mock_ws) {
        this.id = RandomStr(4);

        if(mock_ws){
            this.ws = typeof mock_ws === 'string' ? new TqWebsocket(mock_ws) : mock_ws;
        } else {
            this.ws = new TqWebsocket('ws://127.0.0.1:7777/')
        }

        this.dm = new DataManager();
        this.tm = new TaskManager();
        this.ta = new TaManager(this);

        this.DATA = this.dm.datas;
        this.SEND_MESSAGE = this.ws.send_json;
        this.START_TASK = this.tm.start_task.bind(this.tm);
        this.PAUSE_TASK = this.tm.pause_task.bind(this.tm);
        this.RESUME_TASK = this.tm.resume_task.bind(this.tm);
        this.STOP_TASK = this.tm.stop_task.bind(this.tm);

        this.ws.init();
        this.filename = location.href.split('/').pop();
        this.UI = new Proxy(() => null, {
            get: function (target, key, receiver) {
                let res = UiUtils.readNodeBySelector('input#' + key);
                if (res[key]) return res[key];
                res = UiUtils.readNodeBySelector('input[name="' + key + '"]'); // radio
                if (res[key]) return res[key];
                res = UiUtils.readNodeBySelector('span#' + key);
                if (res[key]) return res[key];
                return undefined;
            },
            set: (function (target, key, value, receiver) {
                this.uistore.set(key, value);
                UiUtils.writeNode(key, value);
            }).bind(this),
            apply: function (target, ctx, args) {
                let params = args[0];
                if (params) for (let key in params) UiUtils.writeNode(key, params[key]);
                else return UiUtils.readNodeBySelector('input');
                return args[0];
            }
        });
        this.init_ui(this);
        this.init_ws_handlers();

        this._subcribe_charts = {};
    }

    subcribe_chart(symbol, dur_sec){
        if (!symbol || !dur_sec) return undefined;
        let key = symbol + '.' + dur_sec;
        let dur_nano = dur_sec * 1e9;
        if(!this._subcribe_charts[key]){
            let chart_id = RandomStr();
            this.ws.send_json({
                "aid": "set_chart",
                "chart_id": chart_id,
                "ins_list": symbol,
                "duration": dur_nano,
                "view_width": 500, // 默认为 500
            });
            this._subcribe_charts[key] = chart_id;
        }
        return this.dm.get_kline_serial(symbol, dur_nano);
    }

    init_ws_handlers(){
        this.ws.addHandler('onmessage', (function(message){
            switch(message.data.aid){
                case "rtn_data":
                    this.on_rtn_data(message.data);
                    break;
                case "delete_indicator_instance":
                    this.on_delete_indicator_instance(message.data);
                    break;
                case "update_indicator_instance":
                    this.on_update_indicator_instance(message.data);
                    break;
                case "update_custom_combine":
                    if(!this.dm.datas.combines) this.dm.datas.combines = {};
                    this.dm.datas.combines[message.data.symbol] = message.data.weights;
                    break;
                default:
                    return;
            }
        }).bind(this));

        this.ws.addHandler('onclose', (function(){
            this.dm.clear_data();
        }).bind(this));
    }

    register_ws_processor(type, processor_func) {
        this.ws.addHandler(type, processor_func);
    }

    unregister_ws_processor(type, processor_func) {
        this.ws.removeHandler(type, processor_func);
    }

    /**
     * 收到aid=="rtn_data"的数据包时, 由本函数处理
     * @param message_rtn_data
     */
    on_rtn_data(message_rtn_data){
        //收到行情数据包
        //根据更新数据包, 调整unit信息
        for (let i = 0; i < message_rtn_data.data.length; i++) {
            let d = message_rtn_data.data[i];
            if (!this.dm.account_id && d.trade){
                this.dm.account_id = Object.keys(d.trade)[0];
            }
            let positions = this.dm.get('trade', this.dm.account_id, 'positions');
            for(let symbol in positions){
                if(positions[symbol].order_volume_sell_open === undefined){
                    positions[symbol].order_volume_buy_open = 0;
                    positions[symbol].order_volume_sell_open = 0;
                    positions[symbol].order_volume_buy_close = 0;
                    positions[symbol].order_volume_sell_close = 0;
                    positions[symbol].order_volume_buy_closetoday = 0;
                    positions[symbol].order_volume_sell_closetoday = 0;
                }
            }
            let orders = getobj(d, 'trade', this.dm.account_id, 'orders');
            for (let order_id in orders){
                let order = orders[order_id];
                let orign_order = this.dm.get('trade', this.dm.account_id, 'orders', order_id);
                let volume_change = order.status == "ALIVE"?order.volume_left:0;
                if (orign_order && orign_order.status == "ALIVE"){
                    volume_change = volume_change - orign_order.volume_left;
                }
                this.process_unit_order(order, volume_change);
            }
        }

        //更新到数据存储区
        this.dm.on_rtn_data(message_rtn_data);
        //重新计算所有技术指标 instance
        for (let id in this.ta.instance_dict) {
            let instance = this.ta.instance_dict[id];
            if (this.dm.is_changing(instance._ds)){
                let [calc_left, calc_right] = instance.calc_range();
                this.send_indicator_data(instance, calc_left, calc_right);
            }
        }
        this.tm.run();
    }

    process_unit_order(order, volume_change) {
        let symbol = order.exchange_id + "." + order.instrument_id;
        for(let user_id in this.dm.datas.trade ){
            let position = this.GET_POSITION(symbol, user_id);
            let dir_offset = order.direction.toLowerCase() + '_' + order.offset.toLowerCase();
            position['order_volume_' + dir_offset] += volume_change;
        }
    }

    on_delete_indicator_instance(pack){
        if(this.ta.instance_dict[pack.instance_id]){
            this.ta.instance_dict[pack.instance_id].instance.return();
            this.ta.delete_indicator_instance(pack.instance_id);
        }
    }

    on_update_indicator_instance(pack){
        //重置指标参数
        let instance_id = pack.instance_id;
        let instance = null;
        let params = {};
        for (let name in pack.params){
            params[name] = pack.params[name].value;
        }
        let ds = this.dm.get_kline_serial(pack.ins_id, pack.dur_nano);
        let c = this.ta.class_dict[pack.ta_class_name];
        if (!c)
            return;

        if (!this.ta.instance_dict[instance_id]) {
            instance = this.ta.new_indicator_instance(c, pack.ins_id, pack.dur_nano, ds, params, pack.instance_id);
        }else{
            instance = this.ta.instance_dict[pack.instance_id];
            if (ds != instance._ds || !Object.equals(params, instance.PARAMS)){
                this.ta.delete_indicator_instance(instance);
                instance = this.ta.new_indicator_instance(c, pack.ins_id, pack.dur_nano, ds, params, pack.instance_id);
            }
        }
        instance.epoch = pack.epoch;
        instance.view_left = pack.view_left;
        instance.view_right = pack.view_right;

        instance.enable_trade = pack.enable_trade;
        if (pack.trade_symbol)
            instance.trade_symbol = pack.trade_symbol;
        if (pack.unit_id)
            instance.unit_id = pack.unit_id;
        instance.volume_limit = pack.volume_limit;

        let [calc_left, calc_right] = instance.calc_range();
        this.send_indicator_data(instance, calc_left, calc_right);
    }
    send_indicator_data(instance, calc_left, calc_right){
        //计算指标值
        if(calc_left > -1 && instance.view_left > -1){
            let datas = {};
            for (let sn in instance.out_values){
                if(instance.out_define[sn].style === 'INVISIBLE')
                    continue;
                datas[sn] = [];
                let s = instance.out_values[sn];
                for(let i in s){
                    datas[sn][i] = s[i].slice(calc_left, calc_right + 1);
                }
            }
            let set_data = {
                aid: "set_indicator_data",                    //必填, 标示此数据包为技术指标结果数据
                instance_id: instance.instance_id,                     //必填, 指标实例ID，应当与 update_indicator_instance 中的值一致
                epoch: instance.epoch,                                  //必填, 指标实例版本号，应当与 update_indicator_instance 中的值一致
                range_left: calc_left,                             //必填, 表示此数据包中第一个数据对应图表X轴上的位置序号
                range_right: calc_right,                            //必填, 表示此数据包中最后一个数据对应图表X轴上的位置序号
                serials: instance.out_define,
                datas: datas,
                drawings: instance.out_drawings,
            };
            this.ws.send_json(set_data);
            instance.out_drawings = {}; // 清空 out_drawings，下次不会重复发送
        }
    }

    IS_CHANGING(obj){
        return this.dm.is_changing(obj);
    }

    GET_ACCOUNT(user_id="") {
        // todo: 未来支持传入不同的子账户
        let account_id = this.dm.account_id + (user_id && (user_id != this.dm.account_id) ? '.' : '') + user_id;
        return this.dm.set_default({}, 'trade', account_id, 'accounts', 'CNY');
    };

    GET_POSITION(symbol, user_id="") {
        // todo: 未来支持传入不同的子账户
        let account_id = this.dm.account_id;
        if(user_id && user_id != this.dm.account_id) account_id += '.' + user_id;
        return this.dm.set_default({
            symbol,
            volume_long:0,
            volume_short:0,
            order_volume_buy_open:0,
            order_volume_sell_open:0,
            order_volume_buy_close:0,
            order_volume_sell_close:0,
            order_volume_buy_closetoday:0,
            order_volume_sell_closetoday:0
        }, 'trade', account_id, 'positions', symbol);
    };

    // GET_UNIT_POSITION(unit_id, symbol) {
    //     let unit = this.dm.set_default({
    //         unit_id,
    //         stat: {close_profit:0},
    //     }, "trade", this.dm.account_id, "units", unit_id);
    //     unit._epoch = this.dm.epoch;
    //     let position = this.dm.set_default({
    //         symbol,
    //         unit_id,
    //         order_volume_buy_open:0,
    //         order_volume_sell_open:0,
    //         order_volume_buy_close:0,
    //         order_volume_sell_close:0,
    //
    //         volume_long:0,
    //         cost_long:0,
    //         volume_short:0,
    //         cost_short:0,
    //     }, unit, "positions", symbol);
    //     return position;
    // };

    GET_COMBINE(combine_id){
        return this.dm.set_default({}, 'combines', 'USER.' + combine_id);
    }

    GET_POSITION_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'positions');
    }

    GET_TRADE_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'trades');
    };

    GET_ORDER_DICT() {
        return this.dm.set_default({}, 'trade', this.dm.account_id, 'orders');
    };

    GET_QUOTE(symbol){
        // 订阅行情
        var ins_list = this.dm.datas.ins_list;
        if (ins_list != undefined && !ins_list.includes(symbol)) {
            var s = ins_list + "," + symbol;
            this.ws.send_json({
                aid: "subscribe_quote",
                ins_list: s,
            });
        }
        return this.dm.set_default({}, 'quotes', symbol);
    }

    GET_KLINE({ kline_id = RandomStr(), symbol=GLOBAL_CONTEXT.symbol, dur_sec=GLOBAL_CONTEXT.duration, width = 100 }={}) {
        let ds = this.subcribe_chart(symbol, dur_sec);
        return ds.proxy; // 这里返回的是实际数据的 proxy
    }

    INSERT_ORDER({symbol, direction, offset, volume=1, price_type="LIMIT", limit_price, order_id, unit_id="EXT", user_id=""}={}) {
        if (!this.dm.account_id){
            if(IsBrowser) Notify.error('未登录交易，请在软件中登录后重试。');
            else if(IsWebWorker) self.postMessage({
                cmd: 'feedback',
                content: {
                    error: true,
                    message: '未登录交易，请在软件中登录后重试。'
                }
            });
            return null;
        }
        if (!order_id)
            order_id = unit_id + '.' + RandomStr(8);
        let {exchange_id, instrument_id} = ParseSymbol(symbol);
        let send_obj = {
            "aid": "insert_order",
            "order_id": order_id,
            "exchange_id": exchange_id,
            "instrument_id": instrument_id,
            "direction": direction,
            "offset": offset,
            "volume": volume,
            "price_type": price_type,
            "limit_price": limit_price,
            "time_condition": price_type === 'ANY' ? 'IOC' : 'GFD',
            "volume_condition": "ANY",
            "hedge_flag": "SPECULATION",
            "user_id": this.dm.account_id + (user_id ? '.' : '') + user_id
        };
        this.ws.send_json(send_obj);

        let order = this.dm.set_default({
            order_id: order_id,
            status: "ALIVE",
            offset: offset,
            direction: direction,
            volume_orign: volume,
            volume_left: volume,
            exchange_id: exchange_id,
            instrument_id: instrument_id,
            limit_price: limit_price,
            price_type: price_type,
            cancelable: true
        }, "trade", this.dm.account_id, "orders", order_id);
        order._epoch = this.dm.epoch;
        this.process_unit_order(order, volume);
        return order;
    };

    CANCEL_ORDER(order) {
        let orders = {};
        if (typeof order === 'object' && order && order.order_id) {
            orders[order.order_id] = order;
        } else if (typeof order === 'string')  {
            let all_orders = this.dm.get('trade', this.dm.account_id, 'orders');
            for (var order_id in all_orders) {
                var ord = all_orders[order_id];
                if (ord.status === "ALIVE" && order_id.startsWith(order))
                    orders[order_id] = ord;
            }
        }
        for (let order_id in orders) {
            if(orders[order_id].status === "ALIVE" && orders[order_id].cancelable ){
                this.ws.send_json({
                    "aid": "cancel_order",
                    "order_id": order_id,
                    "user_id": this.dm.account_id
                });
                orders[order_id].cancelable = false;
            }
        }
        return Object.keys(orders).length;
    }

    REGISTER_INDICATOR_CLASS(ind_class){
        let define_context = this.ta.register_indicator_class(ind_class);
        this.ws.send_json(define_context.get_define());
    }
    UNREGISTER_INDICATOR_CLASS(ind_class_name){
        this.ta.unregister_indicator_class(ind_class_name);
        this.ws.send_json({
            "aid": "unregister_indicator_class",
            "name": ind_class_name
        });
    }

    NEW_INDICATOR_INSTANCE(ind_func, symbol, dur_sec, params={}, instance_id=RandomStr()) {
        let ds = this.subcribe_chart(symbol, dur_sec);
        if (ds) {
            let dur_nano = dur_sec * 1e9;
            return this.ta.new_indicator_instance(ind_func, symbol, dur_nano, ds, params, instance_id);
        }
        return null;
    }
    DELETE_INDICATOR_INSTANCE(ind_instance){
        return this.ta.delete_indicator_instance(ind_instance);
    }

    /**
     * UI 相关
     */
    SET_STATE(cmd) {
        cmd = cmd.toUpperCase();
        if (cmd === 'START' || cmd === 'RESUME') {
            $('.panel-title .STATE').html('<span class="label label-success">运行中</span>');
            $('input').attr('disabled', true);
            $('button.START').attr('disabled', true);
        } else if (cmd === 'PAUSE') {
            $('.panel-title .STATE').html('<span class="label label-warning">已暂停</span>');
            $('input').attr('disabled', true);
            $('button.START').attr('disabled', true);
        } else if (cmd === 'STOP') {
            $('.panel-title .STATE').html('<span class="label label-danger">已停止</span>');
            $('input').attr('disabled', false);
            $('button.START').attr('disabled', false);
        }
    }

    ON_CLICK(dom_id) {
        var this_tq = this;
        return function () {
            if (this_tq.tm.events['click'] && this_tq.tm.events['click'][dom_id]) {
                var d = Object.assign({}, this_tq.tm.events['click'][dom_id]);
                return true;
            }
            return false;
        }
    }

    ON_CHANGE(dom_id) {
        var this_tq = this;
        return function () {
            if (this_tq.tm.events['change'] && this_tq.tm.events['change'][dom_id]) {
                var d = Object.assign({}, this_tq.tm.events['change'][dom_id]);
                return true;
            }
            return false;
        }
    }

    init_ui(){
        if (IsBrowser) {
            this.uistore = new Store(this.filename);
            var this_tq = this;
            $(() => {
                // init code
                var lines = $('#TRADE-CODE').text().split('\n');
                lines.forEach((el, i, arr) => lines[i] = el.replace(/\s{8}/, ''));
                var html = hljs.highlightAuto(lines.join('\n'));
                $('#code_container code').html(html.value);

                $('#collapse').on('hide.bs.collapse', () => $('#collapse_arrow').removeClass('glyphicon-menu-up').addClass('glyphicon-menu-down'));
                $('#collapse').on('show.bs.collapse', () => $('#collapse_arrow').removeClass('glyphicon-menu-down').addClass('glyphicon-menu-up'));
                var allui = this_tq.UI();
                for(var k in allui){
                    if(this_tq.uistore.get(k)){
                        UiUtils.writeNode(k, this_tq.uistore.get(k));
                    }
                }

                $(document).on('click', function (e) {
                    // 页面 Click 事件统一处理 4 类按钮 START RESUME PAUSE END
                    var dataSet = Object.assign({}, e.target.dataset);
                    this_tq.tm.run({ type: e.type, id: e.target.id, data: dataSet });
                });
                $('input').on('change', function (e) {
                    var dataSet = Object.assign({}, e.target.dataset);
                    this_tq.tm.run({ type: e.type, id: e.target.id, data: dataSet });
                    this_tq.uistore.set(e.target.id, e.target.value);
                });
            });
        }
    }

}


/************************************************************
 * UI 部分
 *************************************************************/

const UiUtils = (function () {
    function _writeBySelector(sel, value) {
        let nodeList = document.querySelectorAll(sel);
        let success = false;
        nodeList.forEach((node, index, array) => {
            if (node.nodeName === 'SPAN' || node.nodeName === 'DIV') {
                node.innerText = value;
                success = true;
            } else if (node.nodeName === 'INPUT') {
                if (node.type === 'text' || node.type === 'number') {
                    node.value = value;
                    success = true;
                } else if (node.type === 'radio' && node.value === value) {
                    node.checked = true;
                    success = true;
                }
            }
        });
        return success;
    }
    return {
        readNodeBySelector (sel) {
            let nodeList = document.querySelectorAll(sel);
            let params = {};
            nodeList.forEach((node, index, array) => {
                Object.assign(params, UiUtils.readNode(node));
            });
            return params;
        },
        readNode (node) {
            if (node.nodeName == 'INPUT')
                switch (node.type) {
                    case 'number':
                        return {[node.id]: node.valueAsNumber};
                    case 'text':
                        return {[node.id]: node.value};
                    case 'radio':
                        return node.checked ?
                            {[node.name]: node.value} :
                            {};
                    default:
                        return {[node.id]: undefined};
                }
            else if (node.nodeName == 'SPAN')
                return {[node.id]: node.innerText}
        },
        writeNode (key, value) {
            if (!_writeBySelector('#' + key, value))
                _writeBySelector('input[type="radio"][name=' + key + ']', value);
        }
    }
})();
