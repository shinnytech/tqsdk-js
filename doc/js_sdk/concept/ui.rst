.. _ui:

UI 用户界面
==============================================================
天勤的扩展模块使用标准 HTML/CSS/JS 代码构建界面, 也允许引入任何第三方js或css文件. 用户可以按照自己的意图, 构建任意复杂的交互界面, 或使用第三方库提供的任何特性.

针对交易模块开发中的常见需求, TQSDK 提供了一些便利函数, 用于实现 UI与内存变量间的数据同步


用 UI 函数实现界面与内存变量间的数据同步
--------------------------------------------------------------
参见 :ref:`g_ui`


在 Task 中监听 UI 动作事件
--------------------------------------------------------------
.. code-block:: html

    <button type="button" id="START" data-direction="BUY" data-offset="OPEN">买开</button>

在 Task 函数内部，可以通过 TQ.ON_CLICK 监听按钮事件，返回的对象就是 data-xxx 构成的对象。

.. code-block:: javascript

    function* TaskOrder(TQ) {
        var wait = yield {
            'START': TQ.ON_CLICK('START'),
        }
        var params = TQ.UI();
        params.direction = wait.START.direction; // "BUY"
        params.offset = wait.START.offset; // "OPEN"
        ......
    }