.. _g_stop_task:

TQ.STOP_TASK
==============================
停止运行一个任务。

.. js:function:: TQ.STOP_TASK(task)

   :param object task: task 对象
   :returns: null

示例
----------------------------------

.. code-block:: javascript

    function *TaskOrder(C){
        ......
    }

    var task = START_TASK(TaskOrder);
    STOP_TASK(task);
    