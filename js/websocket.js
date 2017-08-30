
var WS_URL = "ws://127.0.0.1:7777/";


(function () {
    var openObserver = Rx.Observer.create(function(e) {
        console.info('socket open');
        // cs = TM.get_indicator_class_list();
        // socket.onNext(JSON.stringify(cs));
        // cs = TM.get_indicator_class_list();
        //初始化行情数据存储区
        DM.init(function(){});
        //请求全部数据同步
        var demo_d = {
            aid: "sync_datas",
            sync_datas: {},
        };
        socket.onNext(JSON.stringify(demo_d));
        //初始化指标类
        TM.init();
    });

    var closingObserver = Rx.Observer.create(function() {
        //todo: websocket 断线后需要重连
        console.info('socket is about to close');
    });

    var socket = null;

    function initWebsocket()
    {
        socket = Rx.DOM.fromWebSocket(
            WS_URL,
            null, // no protocol
            openObserver,
            closingObserver);
        socket.subscribe(
            function(e) {
                // console.log("ws_get:" + e.data);
                decoded = JSON.parse(e.data, function (key, value) {
                    return value === "NaN"  ? NaN : value;
                });
                if (decoded.aid == "rtn_data") {
                    //收到行情数据包，更新到数据存储区
                    for (var i = 0; i < decoded.data.length; i++) {
                        var temp = decoded.data[i];
                        if (temp.notify) {
                            // console.log(JSON.stringify(temp.notify));
                            // showNotifications(temp.notify, 0);
                        }
                        if( i == decoded.data.length - 1){
                            DM.update_data(temp, "peekMessage");
                        }else{
                            DM.update_data(temp, "");
                        }
                    }
                    //重计算相关的指标值
                    TM.recalc_indicators();
                } else if (decoded.aid == "set_indicator_instance") {
                    //主进程要求创建或修改指标实例
                    console.log("set_indicator_instance:" + e.data);
                    TM.set_indicator_instance(decoded["set_indicator_instance"]);
                }
                socket.onNext('{"aid":"peek_message"}');
            },
            function(e) {
                console.error('error: %s', e);
            },
            function() {
                console.info('socket has been closed');
            }
        );
    }
    function ws_send(obj)
    {
        var s = JSON.stringify(obj);
        socket.onNext(s);
        // console.log("ws_send:"+s);
    }
    this.WS = {
        init: initWebsocket,
        sendJson: ws_send,
    }
}());
