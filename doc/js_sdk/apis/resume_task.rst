.. _g_resume_task:

TQ.RESUME_TASK
==============================
恢复运行一个被暂停的任务。

.. js:function:: TQ.RESUME_TASK(task)

   :param object task: task 对象
   :returns: null

示例
----------------------------------

.. code-block:: javascript

    function *TaskOrder(){
        ......
    }

    var task = START_TASK(TaskOrder);
    PAUSE_TASK(task);
    RESUME_TASK(task);
    