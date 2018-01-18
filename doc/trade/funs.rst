.. _functions:

系统函数列表
==============================

全局函数(全部大写字母，单词中间以 ``_`` 分隔)

启动、暂停、恢复和停止任务
---------------------------------------------------

START_TASK 启动
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
开始一个运行一段交易程序。

.. js:function:: START_TASK(task_func [, param1, param2, ...])

   :param function* task_func: 第一个参数必须是一个 task function 对象，即定义的任务函数。
   :param option task_func: 后面可以传入若干个参数，参数会按照顺序传入 task_func。
   :returns: task 对象 


PAUSE_TASK 暂停
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
暂停运行一个交易程序。

.. js:function:: PAUSE_TASK(task)

   :param object task: 调用 START_TASK() 时返回的对象。
   :returns: task 对象 


RESUME_TASK 恢复
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
恢复运行一个被暂停的交易程序。

.. js:function:: RESUME_TASK(task)

   :param object task: 调用 START_TASK() 时返回的对象。
   :returns: task 对象 

STOP_TASK 停止
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
停止运行一个交易程序。

.. js:function:: STOP_TASK(task)

   :param object task: 调用 START_TASK() 时返回的对象。
   :returns: null

获取数据对象、监听数据变化
---------------------------------------------------
所有获取数据对象的函数，均以 GET_ 开头，返回的均是存储对应信息的对象。

GET_ACCOUNT
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
获取账户信息

.. js:function:: GET_ACCOUNT()

   :returns: 返回账户对象。

GET_POSITION
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
获取持仓信息

.. js:function:: GET_POSITION()

   :returns: 返回账户全部持仓对象。

GET_SESSION
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
获取当前会话信息

.. js:function:: GET_SESSION()

    :returns: 返回当前会话对象。

GET_QUOTE
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
获取指定合约对象

.. js:function:: GET_QUOTE(instrument_id)

    :param string instrument_id: 合约代码。
    :returns: 返回指定合约对象。

GET_ORDER
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
获取指定 id 的订单对象

.. js:function:: GET_ORDER(order_id)

    :param string order_id: 订单id。
    :returns: 返回指定 id 的订单对象。

GET_COMBINE
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
获取用户自定义组合信息

.. js:function:: GET_COMBINE(combine_name)

    :param string combine_name: 自定义组合的名称。
    :returns: 返回用户自定义组合信息。

ON_CHANGED
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. js:function:: ON_CHANGED(data_object)

   查询最近一跳数据包是否更新了制定的数据对象。
   如果不传入参数，直接调用，则返回 true，可以用来表示每次收到数据包都触发此条件。

   :param object data_object: 数据对象，支持所有 GET_XXX 函数返回的对象
   :returns: (boolean) 判断数据对象是否更新的函数    


下单和撤单
---------------------------------------------------

INSERT_ORDER 下单
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
根据传入参数下单。

.. js:function:: INSERT_ORDER(order_param)

   :param object order_param: 参数对象
   :returns: 判断数据对象是否更新的函数  

order_param 中必须包括的字段有（多余的字段不想影响下单）：

================  ========  ===================  =========
name              type      memo                 example
================  ========  ===================  =========
exchange_id       string    交易所代码             CFFEX
instrument_id     string    合约代码               TF1803
direction         string    买卖 "BUY"|"SELL"     SELL              
offset            string    方向 "OPEN"|"CLOSE"   OPEN           
volume            number    手数                  4
limit_price       number    限价价格               96
================  ========  ===================  =========


CANCEL_ORDER 撤单
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
撤销下单。

.. js:function:: CANCEL_ORDER(order)

   :param object order: 订单对象
   :returns: order 

设置运行任务的状态
---------------------------------------------------

SET_STATE 
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. js:function:: SET_STATE(state)

   设置运行任务的状态。任务在设置运行状态后，界面 UI 会处于禁用状态，不能修改参数。

   :param string state: state 共有4种取值 ("START"|"PAUSE"|"RESUME"|"STOP")
   :returns: null

读写页面数据
---------------------------------------------------

UI 部分，UI_DATAS 用于读取页面填写的参数，或者在页面上填写指定数据。需要在 html 标签的 class 属性添加 tq-datas。

.. code-block:: html

    <input type="text" class="form-control tq-datas" id="instrument" placeholder="合约代码" value='SHFE.rb1801'>
    <input type="number" class="form-control tq-datas" id='volume' value="60">

    <input type="radio" class="tq-datas" name="direction" value="BUY" checked>
    <input type="radio" class="tq-datas" name="direction" value="SELL">

UI_DATAS 读、写一组参数对象
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

UI_DATAS 作为函数调用，可以直接读、写一组参数对象。

+ 不传参数直接调用 ``UI_DATAS()`` 为读取页面全部参数。

.. code-block:: javascript

    var params = UI_DATAS();
    /** 
    params = {
        instrument: 'SHFE.rb1801',
        volume: 20,
        direction: 'BUY'
    }
    **/

+ 如果传入一个参数对象，即可更新页面的参数值。

.. code-block:: javascript

    var params = { 
        "instrument" : "SHFE.rb1801",
        "direction" : "SELL",
        "volume" : 100
    }
    UI_DATAS(params); // 可以更新页面对应的数据

UI_DATAS 读、写指定参数
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

UI_DATAS 用点操作符可以直接读写到对应的字段值。

+ 读某个参数

.. code-block:: javascript

    var instrument = UI_DATAS.instrument;
    // instrument = 'SHFE.rb1801'
    var volume = UI_DATAS.volume;
    // volume = 20
    var direction = UI_DATAS.direction;
    // direction = 'BUY'

+ 写某个参数

.. code-block:: javascript

    UI_DATAS.instrument = 'SHFE.rb1805';
    UI_DATAS.volume = 30;
    UI_DATAS.direction = 'SELL';
    // 页面对应数据更新
    