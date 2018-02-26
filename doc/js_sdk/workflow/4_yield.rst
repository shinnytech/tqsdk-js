.. _4_yield:

内存模型
========================================

每个 Task 的第一个参数都是一个 Context 对象，以下记做 C。

C 提供了一些一组数据接口和函数接口，在 Task 中可以调用。

数据接口
----------------------------------------

这里提供了两个数据集，共用户使用。两个数据集都是只读属性，不可修改数据。

:ref:`s_latest_data` 表示的是内存接受到的全部数据集，与服务器同步更新。可以访问到全部数据。

:ref:`s_late_updated_date` 表示服务器最新一次更新的数据集。

.. graphviz::

    digraph dfd2{
        node[shape=record]
        subgraph level0{
            enti1 [label="服务器" shape=box];
        }
        subgraph cluster_level1{
            store [label="Data Centre"];
            api [label="{<f0> C.LATEST_DATA|<f2> C.LAST_UPDATED_DATA}"];
        }

        enti1 -> store [label="发送数据集 LAST_UPDATED_DATA"];
        store -> store [label="数据集 LAST_UPDATED_DATA 合并到 LATEST_DATA"];
        store -> api [label="提供可访问数据"];
    }

如上图所示，客户端在运行过程中不断从服务器接受最新的数据，在每次接受到数据之后，将 C.LAST_UPDATED_DATA 合并到 C.LATEST_DATA。

通过两个数据集，可以方便的访问到不同的数据内容。

函数接口
----------------------------------------

函数主要有以下几种类型：

获取数据对象 GET_XXX
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. toctree::
    :glob:
    :maxdepth: 1

    ../funs/s_get_*


监听页面事件
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. toctree::
    :glob:
    :maxdepth: 1

    ../funs/s_on_*
  
下单和撤单
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. toctree::
    :glob:
    :maxdepth: 1

    ../funs/s_order_*


设置运行任务的状态
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. toctree::
    :glob:
    :maxdepth: 1

    ../funs/s_set_*

