.. _api_resume_task:

恢复 - RESUME_TASK
==============================

.. js:function:: RESUME_TASK(task)

    恢复运行一个被暂停的任务

   :param object task: task 对象
   :returns: null

示例
----------------------------------

.. code-block:: javascript

    function *TaskOrder(){
        ......
    }

    const TQ = new TQSDK();
    var task = START_TASK(TaskOrder);
    TQ.PAUSE_TASK(task); // 暂停
    // ... 若干操作
    TQ.RESUME_TASK(task); // 恢复
