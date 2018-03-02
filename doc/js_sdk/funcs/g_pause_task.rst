.. _g_pause_task:

TQ.PAUSE_TASK
==============================
暂停运行一个任务。

.. js:function:: TQ.PAUSE_TASK(task)

   :param object task: task 对象
   :returns: null

示例
----------------------------------

.. code-block:: javascript

    function *TaskOrder(C){
        ......
    }

    var task = START_TASK(TaskOrder);
    PAUSE_TASK(task);
