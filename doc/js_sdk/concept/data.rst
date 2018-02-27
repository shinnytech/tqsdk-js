.. _data:

Data Access 数据访问
========================================
扩展模块运行时, tq_sdk 将负责从主程序接收数据流, 并在内存中维护行情与交易数据集. 

内存数据结构
----------------------------------------
tq_sdk 使用 javascript dict 在内存中存放所有当前用到的 行情/交易 数据, 数据结构如下:

.. code-block:: javascript

  { 
    "quotes": {                                         //实时行情数据
      "cu1612": {
        "instrument_id": "cu1612",                        //合约代码
        "datetime": "2016-12-30 13:21:32.500000",         //时间
        "ask_price1": 36590.0,                            //卖价
        "ask_volume1": 121,                               //卖量
        "bid_price1": 36580.0,                            //买价
        "bid_volume1": 3,                                 //买量
        "last_price": 36580.0,                            //最新价
        "highest": 36580.0,                               //最高价
        "lowest": 36580.0,                                //最低价
        "amount": 213445312.5,                            //成交额
        "volume": 23344,                                  //成交量
        "open_interest": 23344,                           //持仓量
        "pre_open_interest": 23344,                       //昨持
        "pre_close": 36170.0,                             //昨收
        "open": 36270.0,                                  //今开
        "close": 36270.0,                                 //收盘
        "lower_limit": 34160.0,                           //跌停
        "upper_limit": 38530.0,                           //涨停
        "average": 36270.1,                               //均价
        "pre_settlement": 36270.0,                        //昨结
        "settlement": 36270.0,                            //结算价
      },
      ...
    },
    "klines": {                                           //K线数据
      "cu1601": {                                         //合约代码
      180000000000: {                                   //K线周期, 单位为纳秒, 180000000000纳秒 = 3分钟
        "last_id": 3435,                                //整个序列最后一个记录的序号
        "data": {
        3384: {
          "datetime": 192837400000000,                //UnixNano 北京时间，如果是日线，则是交易日的 UnixNano
          "open": 3432.33,                            //开
          "high": 3432.33,                            //高
          "low": 3432.33,                             //低
          "close": 3432.33,                           //收
          "volume": 2,                                //成交量
          "open_oi": 1632,                            //起始持仓量
          "close_oi": 1621,                           //结束持仓量
        },
        3385: {
          ...
        },
        ...
        },
        "binding": {
        "cu1709": {
          3384: 2900,                                 //本合约K线所对应的另一个合约的K线号
          3385: 2950,
          ...
        }
        }
      },
      ...
      },
      ...
    },
    "ticks": {
      "cu1601": {
      "last_id": 3550,                                  //整个序列最后一个元素的编号
      "data": {
        3384: {
        "datetime": 1928374000000000,                 //UnixNano 北京时间
        "trading_day": 1928374000000000,              //交易日的UnixNano 北京时间
        "last_price": 3432.33,                        //最新价
        "highest": 3452.33,                           //最高价
        "lowest": 3402.33,                            //最低价
        "bid_price1": 3432.2,                         //买一价
        "ask_price1": 3432.4,                         //卖一价
        "bid_volume1": 1,                             //买一量
        "ask_volume1": 2,                             //卖一量
        "volume": 200,                                //成交量
        "open_interest": 1621,                        //持仓量
        },
        3385: {
        ...
        },
        ...
      }
      },
      ...
    },
    "notify": {                                           //通知信息
      "2010": {
      "type": "MESSAGE",                                //MESSAGE TEXT
      "code": 1000,
      "content": "abcd",
      }
    },
    "trade": {                                            //交易相关数据
      "user1": {                                          //登录用户名
        "user_id": "user1",                               //登录用户名
        "session": {                                      //当前session信息
          "session_id": "1434",
          "max_order_id": "4423",
        },
        "accounts": {                                     //账户资金信息
          "CNY": {                                        //account_key, 通常为币种代码
                                    //核心字段
            "account_id": "423423",                       //账号
            "currency": "CNY",                            //币种
            "balance": 9963216.550000003,                 //账户权益
            "available": 9480176.150000002,               //可用资金
                                    //参考字段
            "pre_balance": 12345,                         //上一交易日结算时的账户权益
            "deposit": 42344,                             //本交易日内的入金金额
            "withdraw": 42344,                            //本交易日内的出金金额
            "commission": 123,                            //本交易日内交纳的手续费
            "preminum": 123,                              //本交易日内交纳的权利金
            "static_balance": 124895,                     //静态权益
            "position_profit": 12345,                     //持仓盈亏
            "float_profit": 8910.231,                     //浮动盈亏
            "risk_ratio": 0.048482375,                    //风险度
            "margin": 11232.23,                           //占用资金
            "frozen_margin": 12345,                       //冻结保证金
            "frozen_commission": 123,                     //冻结手续费
            "frozen_premium": 123,                        //冻结权利金
            "close_profit": 12345,                        //本交易日内平仓盈亏
            "position_profit": 12345,                     //当前持仓盈亏
            "position_profit": 12345,                     //当前持仓盈亏
          }
        },
        "positions": {                                    //持仓
          "SHFE.cu1801": {                                //position_key, 对于普通持仓, position_key=symbol, 对于
                                    //核心字段
            "exchange_id": "SHFE",                        //交易所
            "instrument_id": "cu1801",                    //合约代码
            "volume_long": 5,                             //多头持仓手数
            "volume_short": 5,                            //空头持仓手数
            "hedge_flag": "SPEC",                         //套保标记
                                    //参考字段
            "open_price_long": 3203.5,                    //多头开仓均价
            "open_price_short": 3100.5,                   //空头开仓均价
            "open_cost_long": 3203.5,                     //多头开仓市值
            "open_cost_short": 3100.5,                    //空头开仓市值
            "margin": 32324.4,                            //占用保证金
            "float_profit_long": 32324.4,                 //多头浮动盈亏
            "float_profit_short": 32324.4,                //空头浮动盈亏
            "volume_long_today": 5,                       //多头今仓手数
            "volume_long_his": 5,                         //多头老仓手数
            "volume_long_frozen": 5,                      //多头持仓冻结
            "volume_long_frozen_today": 5,                //多头今仓冻结
            "volume_short_today": 5,                      //空头今仓手数
            "volume_short_his": 5,                        //空头老仓手数
            "volume_short_frozen": 5,                     //空头持仓冻结
            "volume_short_frozen_today": 5,               //空头今仓冻结
          }
        },
        "orders": {                                       //委托单
          "abc|123": {                                    //order_key, 用于唯一标识一个委托单
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
          }
        },
        "trades": {                                       //成交记录
          "abc|123|1": {                                  //trade_key, 用于唯一标识一个成交项
                                                          //核心字段
            "session_id": "abc",
            "order_id": "123",
            "exchange_id": "SHFE",                        //交易所
            "ins_id": "cu1801",                           //交易所内的合约代码
            "exchange_trade_id": "1243",                  //交易所成交号
            "direction": "BUY",                           //成交方向
            "offset": "OPEN",                             //开平标志
            "volume": 6,                                  //成交手数
            "price": 1234.5,                              //成交价格
                                                          //参考字段
            "trade_date_time": "2017/03/04T10:30:20"      //成交时间
            "commission": 30.2                            //手续费
          }
        },
      },
    },
  }
  
直接访问内存数据集中的数据
----------------------------------------
TQSDK 中有一个全局变量 DATA 指向整个数据集. 由于这数据集是一个标准的 javascript object, 因此可以使用简单的 javascript 语法来直接访问其中的任意数据, 像这样

.. code-block:: javascript
  :caption: 获取 SHFE.cu1801 合约的最新价
  
  let last_price = LAST_DATA["quotes"]["SHFE.cu1801"]["last_price"];
  /*
      last_price = 3540.5
  */


.. code-block:: javascript
  :caption: 获取 SHFE.cu1801 合约的持仓信息
  
  let position = LAST_DATA["trade"]["user1"]["positions"]["SHFE.cu1801"];
  /*
      position = {
        exchange_id: "SHFE",
        instrument_id: "cu1801",
        volume_long: 5,
        ...
      }
  */

除 LAST_DATA 外, TQSDK 还维护了另一个数据集 CHANGING_DATA, 其结构与 DATA 相同, 仅包含了最近一次更新的数据内容

:ref:`s_latest_data` 表示的是内存接受到的全部数据集，与服务器同步更新。可以访问到全部数据。

:ref:`s_late_updated_date` 表示服务器最新一次更新的数据集。

.. graphviz::

    digraph dfd2{
        node[shape=record]
        subgraph level0{
            enti1 [label="服务器" shape=box];
        }
        subgraph cluster_level1{
            store [label="Data Centre"];
            api [label="{<f0> C.LATEST_DATA|<f2> C.LAST_UPDATED_DATA}"];
        }

        enti1 -> store [label="发送数据集 LAST_UPDATED_DATA"];
        store -> store [label="数据集 LAST_UPDATED_DATA 合并到 LATEST_DATA"];
        store -> api [label="提供可访问数据"];
    }

如上图所示，客户端在运行过程中不断从服务器接受最新的数据，在每次接受到数据之后，将 C.LAST_UPDATED_DATA 合并到 C.LATEST_DATA。

通过两个数据集，可以方便的访问到不同的数据内容。



通过数据访问函数访问数据
----------------------------------------
直接访问数据集时, 用户需要自行负责错误处理. 为简化用户策略代码, sdk封装了几个简单的数据访问函数:

* :ref:`s_get_quote`
* :ref:`s_get_account`
* :ref:`s_get_position`
* :ref:`s_get_order`

这些函数在成功时都返回对应的object, 失败时返回 undefined
