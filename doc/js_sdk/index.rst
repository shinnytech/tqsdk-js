交易程序
========================================

介绍
----------------------------------------

天勤是一款专业的行情软件，不仅能够提供高质量的行情数据，还能够支持自定义交易程序，帮助您轻松实现程序化交易。

这篇文档是对天勤交易软件的程序交易的功能的详细说明，能够帮助您快速理解和开始使用天勤进行交易。

文档分为四个部分：

1. 开始上手，通过一个具体简单的示例，在 5 分钟内了解到如何使用天勤软件和 Javascript 编写你想要交易程序。
2. 介绍这里使用到的关键 Javascript 技术，和标准的交易程序开发流程。
3. 方便查阅的系统的库函数。
4. 更多的示例。

第一章 开始上手
------------------------------------------

下面我们就开始一起实现一个简单的交易系统。

这个程序能够完成的功能是：以指定价格下单指定手数，直到全部手数成交。

.. toctree::
    :maxdepth: 1

    example/1_prepare.rst
    example/2_new.rst
    example/3_config.rst
    example/4_define.rst
    
第二章 开发流程
------------------------------------------

.. toctree::
    :maxdepth: 1

    workflow/1_page.rst
    workflow/2_start_stop.rst
    workflow/3_function.rst
    workflow/4_yield.rst

第三章 函数列表
------------------------------------------

.. toctree::
    :maxdepth: 2

    funs/global_funs.rst

.. toctree::
    :maxdepth: 3
    
    funs/system_funs.rst

第四章 更多示例 
------------------------------------------

+ :ref:`1_spread`
+ :ref:`2_split`
+ :ref:`3_combine`

.. _天勤客户端下载地址: http://tq18.cn/
.. _Chrome 浏览器下载地址: https://www.google.com/chrome/browser/desktop/index.html
