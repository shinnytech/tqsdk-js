.. _g_start_task:

START_TASK 启动
==============================

开始一个运行一段交易程序。

.. js:function:: START_TASK(task_func [, param1, param2, ...])

   :param function* task_func: 第一个参数必须是一个 task function 对象，即定义的任务函数。
   :param option task_func: 后面可以传入若干个参数，参数会按照顺序传入 task_func。
   :returns: task 对象 

示例
----------------------------------

.. code-block:: javascript

    function *TaskOrder(C){
        ......
    }

    var task = START_TASK(TaskOrder);
    