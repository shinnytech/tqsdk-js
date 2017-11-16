class ORDER {
    constructor(session_id, order_id) {
        this.session_id = session_id;
        this.order_id = order_id;
        this.id = session_id + '|' + order_id;
    }
}

const trader_context = function() {
    function insertOrder(ord){
        var order_id = OrderIds.next().value;
        var send_obj = {
            "aid": "insert_order",
            "order_id": order_id,
            "user_id": DM.get_session().user_id,
            "exchange_id": ord.exchange_id,
            "instrument_id": ord.instrument_id,
            "direction": "BUY",
            "offset": "OPEN",
            "volume": ord.volume,
            "price_type": "LIMIT",
            "limit_price": ord.limit_price
        };
        WS.sendJson(send_obj);
        return new ORDER(DM.get_session().session_id, order_id);
    };

    function cancelOrder(order){
        if(order instanceof ORDER){
            var ord = DM.get_order(order.id);
            
            var send_obj = {
                "aid": "cancel_order",          //必填, 撤单请求
                "order_session_id": ord.session_id,     //必填, 委托单的session_id
                "order_id": ord.order_id,             //必填, 委托单的order_id
                "exchange_id": ord.exchange_id,         //必填, 交易所
                "instrument_id": ord.instrument_id,      //必填, 合约代码
                //"action_id": "0001",            //当指令发送给飞马后台时需填此字段, 
                "user_id": DM.get_session().user_id,             //可选, 与登录用户名一致, 当只登录了一个用户的情况下,此字段可省略
            }
            WS.sendJson(send_obj);
            return order;
        }else {
            console.info('CANCEL_ORDER:', '传入的参数不是 ORDER 类型', order);
            return null;
        }
    }
        
    function thunkify(fn) {
        return function() {
            var args = new Array(arguments.length);
            var ctx = this;
        
            for (var i = 0; i < args.length; ++i) {
                args[i] = arguments[i];
            }
        
            return function (done) {
                var called;
        
                args.push(function () {
                    if (called) return;
                    called = true;
                    done.apply(null, arguments);
                });
        
                try {
                    fn.apply(ctx, args);
                } catch (err) {
                    done(err);
                }
            }
        }
    }

    var getConditions = function(params){
        var cdts = {};
        if(params instanceof Object){
            if(params instanceof Array){
                // begin with and
            }else{
                // begin with or
            }
        }else{
            console.log('传入的参数类型错误')
        }
    }

    var check_order = function(params, cb){
        var TIMEOUT = params.TIMEOUT ? parseInt(params.TIMEOUT) : 5000;
        
        var cdt = getConditions(params);

        var st = setTimeout(()=>{
            clearInterval(si);
            cb(null, {
                status: "TIMEOUT"
            })
        }, TIMEOUT);

        var checkItem =  function(node){
            if(typeof node == 'function'){
                return node();
            }else if(node instanceof Array){
                // array &&
                for(var i in node){
                    if(!checkItem(node[k])){
                        return false;
                    }
                }
                return true;
            }else{
                // object ||
                for(var k in node){
                    if(checkItem(node[k])){
                        return true;
                    }
                }
                return false;
            }
        }

        var check = function(){
            for(var k in params){
                if(checkItem(params[k])){
                    clearTimeout(st);
                    clearInterval(si);
                    cb(null, {
                        status: k
                    })
                    break;
                }
            }
        }

        var si = setInterval(check, 100);

    }

    function getOrderStatus(ord){
        if(DM.get_order(ord.id) == undefined){
            return 'UNDEFINED';
        }else{
            return DM.get_order(ord.id).status;
        } 
    }

    function getOrderTradedVolume(ord){
        var o = DM.get_order(ord.id);
        return o.volume_orign - o.volume_left;
    }


    return {
        INSERT_ORDER: insertOrder,
        CANCEL_ORDER: cancelOrder,
        CHECK_ORDER: thunkify(check_order),
        GET_ORDER_STATUS: getOrderStatus,
        GET_ORDER_TRADED_VOLUME: getOrderTradedVolume,
        GET_ACCOUNT: DM.get_account,
        GET_POSITION: DM.get_positions,
        GET_SESSION: DM.get_session,
        GET_ORDER: DM.get_order,
    }
} ();

function TradeRun(fn){
    var gen = fn(trader_context);

    function next(err, data){
        var result = gen.next(data);
        if(result.done) return;
        result.value(next);
    }

    next();
}

const TD = (function () {
     
    function execTrader(content) {
        let funcName = content.name;
        let code = content.draft.code;

        let id = Keys.next().value;
        postMessage({
            cmd: 'trade_start', content: {
                id: id,
                className: funcName,
            },
        });
        
        try {
            eval(funcName + ' = ' + code);
            TradeRun(self[funcName]);
            
        }catch(e){
            console.log(e)
        }

        postMessage({
            cmd: 'trade_end', content: {
                id: id,
                className: funcName,
            },
        });
    }

    return {
        execTrader: execTrader
    };
}());
