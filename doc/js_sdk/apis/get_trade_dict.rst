.. _api_get_order_dict:

获取报单信息 - GET_ORDER_DICT
==================================

获取用户当前账户下全部报单信息

.. js:function:: GET_ORDER_DICT()

    :returns: 返回指定 id 的订单对象。

用法示例
----------------------------------

如果您已经获得 order_id ，可以这样查看指定 id 的信息：

.. code-block:: javascript

    const TQ = new TQSDK();
    var orders = TQ.GET_ORDER_DICT();


返回数据结构示例
----------------------------------

.. code-block:: javascript

    {
        "EXT.jkdeSkOJ":{  // order_id
            //核心字段
            "order_type": "TRADE",                        //指令类型
            "session_id": "abc",                          //会话ID
            "order_id": "123",                            //委托单ID, 在每个会话中唯一
            "exchange_id": "SHFE",                        //交易所
            "instrument_id": "cu1801",                    //合约代码
            "direction": "BUY",                           //下单方向
            "offset": "OPEN",                             //开平标志
            "volume_orign": 6,                            //总报单手数
            "volume_left": 3,                             //未成交手数
            "trade_type": "TAKEPROFIT",                   //指令类型
            "price_type": "LIMIT",                        //价格类型
            "limit_price": 45000,                         //委托价格, 仅当 price_type = LIMIT 时有效
            "time_condition": "GTD",                      //时间条件
            "volume_condition": "ANY",                    //数量条件
            "min_volume": 0,
            "hedge_flag": "SPECULATION",                  //保值标志
            "status": "ALIVE",                            //委托单状态, ALIVE=有效, FINISHED=已完
            //参考字段
            "last_msg": "",                               //最后操作信息
            "force_close": "NOT",                         //强平原因
            "frozen_money": 15750,                        //冻结金额
            "insert_date_time": "151754",                 //下单时间
            "exchange_order_id": "434214",                //交易所单号
        },
        ......
    }
