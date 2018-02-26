.. _3_function:

Task 结构说明
========================================

每个 Task 都是一个 Generator Function。

Generator 函数是 ES6 提供的一种异步编程解决方案，执行 Generator 函数会返回一个遍历器对象。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。

形式上，Generator 函数有两个特征。一是，function关键字与函数名之间有一个星号；二是，函数体内部使用 yield 表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）。

在天勤交易语法中，yield 后面返回的对象表示程序交易的状态。

客户端在每次收到服务器发来的数据包时，都会检查 yield 后面的条件，只要其中某个条件成立，程序即会继续运行到下一个 yield。


.. graphviz::

    digraph idp_modules{
        fontname = "Microsoft YaHei";
        rankdir = TB;
     
        node [fontname = "Microsoft YaHei", fontsize = 12, shape = "record" ];
        edge [fontname = "Microsoft YaHei", fontsize = 10 ];

        subgraph cluster_sl{
             label="IDP支持层";
             bgcolor="mintcream";
             node [shape="Mrecord", color="skyblue", style="filled"];
             network_mgr [label="网络管理器"];
             log_mgr [label="日志管理器"];
             module_mgr [label="模块管理器"];
             conf_mgr [label="配置管理器"];
             db_mgr [label="数据库管理器"];
        };
     
        subgraph cluster_md{
             label="可插拔模块集";
             bgcolor="lightcyan";
             node [color="chartreuse2", style="filled"];
             mod_dev [label="开发支持模块"];
             mod_dm [label="数据建模模块"];
             mod_dp [label="部署发布模块"];
        };
     
     mod_dp -> mod_dev [label="依赖..."];
     mod_dp -> mod_dm [label="依赖..."];
     mod_dp -> module_mgr [label="安装...", color="yellowgreen", arrowhead="none"];
     mod_dev -> mod_dm [label="依赖..."];
     mod_dev -> module_mgr [label="安装...", color="yellowgreen", arrowhead="none"];
     mod_dm -> module_mgr [label="安装...", color="yellowgreen", arrowhead="none"];
    }

yield 返回数据的说明 

yield 返回的是一个对象，根据不同对象的类型，返回不同结果。

+ Function

+ Array

+ Object

.. math::

==========  ==========  ==========
type        return
==========  ==========  ==========
Function    False  False
Array        False  False
Object       True   False
Others        True   True
==========  ==========  ==========



http://es6.ruanyifeng.com/#docs/generator
https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator
