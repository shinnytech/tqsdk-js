.. _g_stop_task:

STOP_TASK 停止
==============================
停止运行一个任务。

.. js:function:: STOP_TASK(task)

   :param object task: 调用 START_TASK() 时返回的对象。
   :returns: null

示例
----------------------------------

.. code-block:: javascript

    function *TaskOrder(C){
        ......
    }

    var task = START_TASK(TaskOrder);
    STOP_TASK(task);
    