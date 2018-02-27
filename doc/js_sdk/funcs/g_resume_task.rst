.. _g_resume_task:

RESUME_TASK 恢复
==============================
恢复运行一个被暂停的任务。

.. js:function:: RESUME_TASK(task)

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
    RESUME_TASK(task);
    