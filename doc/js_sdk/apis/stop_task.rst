.. _api_stop_task:

停止 STOP_TASK
==============================

.. js:function:: STOP_TASK(task)

    停止运行一个任务

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
    TQ.STOP_TASK(task);
