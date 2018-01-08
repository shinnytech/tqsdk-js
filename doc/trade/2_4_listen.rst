.. _2_4_listen:

监听页面事件
=======================================

前面一节只是定义了一个任务，下面我们要监听按钮的单机事件，以开始运行一个任务。

.. code-block:: javascript

    var task_trade = null;
    $(function () {
        INIT_UI();
        $('button.START').on('click', function (e) {
            // 单击某个开始按钮
            var direction = e.target.dataset.direction;
            var offset = e.target.dataset.offset;
            if (task_trade === null || task_trade.stopped) task_trade = START_TASK(TaskOrder, direction, offset);
        });
        $('button.STOP').on('click', function () {
            // 单击停止按钮
            runningFlag = false;
        });
    });

说明

+ 本例中有分别有买开、卖开、买平、卖平 4 个按钮，可以开始任务
+ 根据按钮附加的数据来获取到用户想要的操作参数：买卖方法和开平
+ START_TASK(TaskOrder, direction, offset) 第一个参数为我们上一节定义的任务函数，START_TASK链接

