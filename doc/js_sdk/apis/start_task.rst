.. _api_start_task:

开始 START_TASK
==============================

.. js:function:: START_TASK(task_func [, param1, param2, ...])

    开始一个任务

   :param function* task_func: 第一个参数必须是一个 task function 对象，即定义的任务函数。
   :param option task_func: 后面可以传入若干个参数，参数会按照顺序传入 task_func。
   :returns: task 对象


示例
----------------------------------

.. code-block:: javascript

    const TQ = new TQSDK();

    function *TaskOrder(x, y){
        ......
    }

    var task = TQ.START_TASK(TaskOrder, 1, 2);
