.. _s_get_account:

TQ.GET_ACCOUNT
==================================

获取账户信息

.. js:function:: GET_ACCOUNT(from=TQ.DATA)

    :param object from: 数据源 (TQ.DATA 或 TQ.CHANGING_DATA)。
    :returns: 返回当前登录的账户对象。


用法示例
----------------------------------

查看当前账户信息：

.. code-block:: javascript

    let account = TQ.GET_ACCOUNT();


查看最近一次更新中的账户信息：

.. code-block:: javascript

    let account = TQ.GET_ACCOUNT(C.CHANGING_DATA);


返回数据结构示例
----------------------------------

.. code-block:: javascript

    {
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