.. _g_pause_task:

PAUSE_TASK 暂停
==============================
暂停运行一个任务。

.. js:function:: PAUSE_TASK(task)

   :param object task: 调用 START_TASK() 时返回的对象。
   :returns: task 对象

示例
----------------------------------

.. code-block:: javascript

    function *TaskOrder(C){
        ......
    }

    var task = START_TASK(TaskOrder);
    PAUSE_TASK(task);
