
var WS_URL = "ws://www.zhongqijiaoyi.com/api/t/md/front/mobile";

var demo_d = {
    aid: "set_chart",
    chart_id: "demo_d",
    ins_list: "IF1709",
    duration: 3600 * 1000 * 1000 * 1000, // 小时线
    view_width: 500
}

function initWebsocket()
{
    var openObserver = Rx.Observer.create(function(e) {
        console.info('socket open');
        // cs = TM.get_indicator_class_list();
        // socket.onNext(JSON.stringify(cs));
        // cs = TM.get_indicator_class_list();
        socket.onNext(JSON.stringify(demo_d));
    });

    var closingObserver = Rx.Observer.create(function() {
        //todo: websocket 断线后需要重连
        console.info('socket is about to close');
    });

    var socket = Rx.DOM.fromWebSocket(
        WS_URL,
        null, // no protocol
        openObserver,
        closingObserver);

    socket.subscribe(
        function(e) {
            decoded = JSON.parse(e.data);
            if (decoded.aid == "rtn_data") {
                //收到行情数据包，更新到数据存储区
                for (var i = 0; i < decoded.data.length; i++) {
                    var temp = decoded.data[i];
                    if (temp.notify) {
                        // console.log(JSON.stringify(temp.notify));
                        showNotifications(temp.notify, 0);
                    }
                    if( i == decoded.data.length - 1){
                        DM.update_data(temp, "peekMessage");
                    }else{
                        DM.update_data(temp, "");
                    }
                }
                //重计算相关的指标值
                TM.recalc_indicators();
            } else if (decoded.aid == "indicator_instance") {
                /*
                    //主进程要求创建指标实例
                    {
                      aid: indicator_instance,
                      indicator_instance: {
                        instance_id: "reuri",
                        epoch: 3232,
                        x_axis: "cu1703.M1",
                        params: [328, 322, 323],
                      }
                    }
                */

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