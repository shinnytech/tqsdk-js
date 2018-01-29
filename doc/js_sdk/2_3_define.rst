.. _2_3_define:

交易程序
=======================================

交易任务用一个 generate function 来表示，形式为 

.. code-block:: javascript

    function* TaskName(C [, options] ) {
        ...
        var result = yield {}
        ...
        return;
    }

说明::

    1. 关键字 ``function`` 和函数名中间必须有一个 ``*``。
    2. 函数的参数，第一个参数为系统提供的环境，以及生成任务时传入的参数。
    3. 关键字 ``yield`` 表示，函数在执行到这里时，会检查后面对象的真值，并以对象形式返回，后面代码中就可以根据返回的内容执行不同的逻辑
    4. 关键字 ``return`` 表示函数执行完毕。

Example
-----------------------------------------------------

.. code-block:: javascript

    // 全局标识任务是否在运行
    var runningFlag = true;
    function* TaskOrder(C, direction, offset) {
        runningFlag = true;
        SET_STATE('START'); // 任务开始

        var params = UI_DATAS(); // 读取页面参数
        params.direction = direction;
        params.offset = offset;

        var [exchange_id, instrument_id] = params.instrument.split('.');
        Object.assign(params, { exchange_id, instrument_id });

        var completed = false;
        var order = C.INSERT_ORDER(params);

        while (order && !completed) {
            var result = yield {
                CHANGED: ON_CHANGED(order),
                USER_CLICK_STOP: function () { return runningFlag === false }
            };

            if (order.status === "FINISHED") completed = true;
            if (result.USER_CLICK_STOP) {
                C.CANCEL_ORDER(order);
                completed = true;
            }
        }

        SET_STATE('END'); // 任务结束
        return;
    }

说明::

    1. 当设置 SET_STATE('START') 后，界面显示任务运行中，任务运行过程中不可以修改界面参数。
       要想修改参数，需要停止任务 => 修改参数 => 重新开始任务。
    2. UI_DATAS() 函数不传入参数，可以读取用户在页面填入全部的参数。
       本例中有 3 个参数：合约代码，下单手数，下单价格。
    3. 下单方向和开平是根据用户单击不同的按钮，传入不同的参数 direction，offset
    4. GET_QUOTE 方法可以获得指定的合约对象。
    5. ON_CHANGED 函数可以检测，传入参数对象中的数据是否有更新，传入参数支持全部 GET_XXX 形式返回的对象。
    5. 根据 INSERT_ORDER 下单函数需要的参数，我们为 params 添加需要的字段
    6. 程序每收到一个数据包，就会运行到关键字 yield 位置，检查 yield 之后的对象的真值，本例中检查 3 个条件：
        - CHANGED：order 对象中数据是否有更新，即有成交
        - USER_CLICK_STOP：用户时候提前单击了结束按钮
        - TIMEOUT：设置超时毫秒数，默认 6000000
    7. 检查到某个条件值为真时，会返回 result
    8. 当 order.status === "FINISHED" 成立时，completed 置为真，任务完成
    9. 当用户提前单击结束按钮时，撤掉发出的订单，completed 置为真，任务完成
    10. 界面显示任务结束，任务运行结束可以修改界面参数

下一步
-------------------------------------------------------
到此，我们已经设置好整个交易程序，下一节就会真正运行这个交易程序。
