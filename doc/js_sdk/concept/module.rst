.. _module:

Module 扩展模块
========================================
一个扩展模块是一个 HTML 文件, 它通常包含:

* 引用 tq_sdk.js (天勤 javascript SDK)
* 一些 html 代码, 用于构成板块的UI界面
* 一些 javascript 代码, 用于实现业务逻辑 (也可以写在独立的js文件中，再通过 script 标签引入页面)
* (可选)其它第三方js/css文件

.. note::
    每个扩展模块都分别维护了一个到主程序的 websocket 连接, 扩展模块通过此接口与主程序通讯. 不同的扩展模块之间完全隔离运行.

TQSDK 使用前必须实例化，


.. code-block:: javascript
    :caption: 实例化 TQSDK

        const TQ = new TQSDK();
