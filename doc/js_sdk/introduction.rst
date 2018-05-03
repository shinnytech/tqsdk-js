.. _introduction:

简介
========================================

天勤软件提供了多种扩展方式，本章主要介绍如何使用 JavaScript SDK。


为什么使用 JavaScript SDK
------------------------------------------

JavaScript SDK 在天勤扩展方式之一，是指使用 JavaScript 语言编写扩展程序。

1. JavaScript 是一种图灵完备的语言，也就是说是一种理论上可以完成任何工作的语言。JavaScript 语法简单，应用广泛，在互联网上有大量学习资源、论坛。

2. JavaScript、HTML 和 CSS 是开发网页的三种核心语言，是一整套完整的开发框架。使用这种框架制作带界面的板块非常方便, 而且开发的板块可以直接嵌入软件界面, 实现无缝集成。

3. 天勤软件内置 v8 引擎，其自带的 **指标编辑器** 和 **策略下单** 功能就是使用 JavaScript + HTML 开发的，所以采用 JavaScript 编写扩展程序不需要专门搭建开发环境，在软件内即可直接运行、调试代码。

4. 天勤软件内置了 **指标编辑器**，开发人员专门对运行技术指标进行过优化，用户可以用较短的代码实现各种技术指标需求，同时获得较高的运行性能。

5. 为了方便用户使用以前在文华等平台上积累的指标代码，我们提供了一个网址 `天勤翻译器`_，可以将文华等代码翻译成天勤支持的 JavaScript 语言，方便在天勤软件中使用、继续开发。通过天勤软件提供的调试功能，可以提高开发效率。

6. 用户编写的指标代码全部存储在本地文件中，可以保证用户数据隐私和安全。


JavaScript SDK
------------------------------------------

JavaScript SDK 提供了一个模块 TQSDK，用户通过 TQSDK 提供的接口，来与主进程交互：

1. `ws` - 维持 js 线程与天勤软件(主程序)之间的 websocket 连接
2. `dm` - 数据存储与数据管理
3. `ta` - 技术指标
4. `tm` - 程序化交易


.. graphviz::

    digraph structs {
        node [shape=plaintext];

        struct1 [label=<<TABLE>
        <TR>
            <TD BGCOLOR='olivedrab1' colspan='2'>TQSDK API(对外提供接口)</TD>
            <TD BGCOLOR='olivedrab1'>计算函数(MA/EMA/STDEV/......)</TD>
        </TR>
        <TR><TD>TaManager(自定义指标管理器)</TD><TD>TaskManager(程序化交易任务管理器)</TD></TR>
        <TR><TD colspan='2'>DataManager</TD></TR>
        <TR><TD colspan='2'>WebSocket</TD></TR>
        </TABLE>>];
    }


指标编辑器
------------------------------------------


程序化交易
------------------------------------------




.. _天勤翻译器: http://127.0.0.1/ta/translate.html
