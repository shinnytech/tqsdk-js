.. _2_4_listen:

运行交易程序
=======================================

前面一节只是定义了一个任务，如何开始一个任务呢？这时我们需要监听页面按钮的单击事件，以开始运行一个任务。


Example
-----------------------------------------------------

.. code-block:: javascript

    var task_trade = null;
    $(function () {
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

说明::

    1. 本例中有分别有买开、卖开、买平、卖平 4 个按钮，可以开始任务
    2. 根据按钮附加的数据来获取到用户想要的操作参数：买卖方法和开平
    3. START_TASK(TaskOrder, direction, offset) 第一个参数为我们上一节定义的任务函数，START_TASK链接

运行
------------------------------------------------------

恭喜，马上就可以正式运行任务下单了。

+ 方式一、在天勤客户端中，右击刚刚添加的板块，右键菜单中选择刷新。
+ 方式二、在 Chrome 浏览器中打开，刷新页面，http://taide.tq18.cn/trader/trader_user.html。

单击买开或者卖开按钮，即可开始运行下单任务。试试吧。