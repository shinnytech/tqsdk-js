.. _api_pause_task:

暂停 PAUSE_TASK
==============================

.. js:function:: PAUSE_TASK(task)

    暂停运行一个任务

   :param object task: task 对象
   :returns: null

示例
----------------------------------

.. code-block:: javascript

    function *TaskOrder(){
        ......
    }

    const TQ = new TQSDK();
    var task = TQ.START_TASK(TaskOrder);
    TQ.PAUSE_TASK(task);
