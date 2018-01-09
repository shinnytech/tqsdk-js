.. _functions:

==============================
系统函数列表
==============================


全局函数(全部大写字母，单词中间以 ``_`` 分隔)

START_TASK
------------------------------

PAUSE_TASK
------------------------------

RESUME_TASK
------------------------------

RESUME_TASK
------------------------------

INSERT_ORDER
------------------------------

CANCEL_ORDER
------------------------------

GET_ACCOUNT
------------------------------

GET_POSITION
------------------------------

GET_SESSION
------------------------------

GET_QUOTE
------------------------------

GET_ORDER
------------------------------

GET_COMBINE
------------------------------


CHANGED
--------------------------------------------------
查询最近一跳数据包是否有该对象。

.. js:function:: CHANGED(field_name, field_id)

    :param string field_name: 对象字段名, 内容见下表 type
    :param field_id: 对象字段唯一标识，object 或者 id
    :returns: true or false.

详细说明

    =========== ================= ===================
    field_name  Value/Description field_id
    =========== ================= ===================
    quote       行情               合约id 或者 合约对象
    order       订单               订单id 或者 订单对象
    combine     自定义组合          组合id 或者 组合对象
    =========== ================= ===================

QUOTE_CHANGED
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. js:function:: QUOTE_CHANGED(id)

   查询最近一跳数据包是否有某个合约的行情。

   :param id: 合约id 或者 合约对象
   :returns: true or false.

ORDER_CHANGED
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ 
.. js:function:: ORDER_CHANGED(id)

   查询最近一跳数据包是否有某个订单。

   :param id: 订单id 或者 订单对象
   :returns: true or false.       

COMBINE_CHANGED
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. js:function:: COMBINE_CHANGED(id)

   查询最近一跳数据包是否有某个自定义组合。

   :param id: 自定义组合id 或者 组合对象
   :returns: true or false.       

UI_DATAS 读写页面数据
---------------------------------------------------

UI 部分，UI_DATAS 用于读取页面填写的参数，或者在页面上填写指定数据。需要在 html 标签的 class 属性添加 tq-datas。

.. code-block:: html

    <input type="text" class="form-control tq-datas" id="instrument" placeholder="合约代码" value='SHFE.rb1801'>
    <input type="number" class="form-control tq-datas" id='volume' value="60">

    <input type="radio" class="tq-datas" name="direction" value="BUY" checked>
    <input type="radio" class="tq-datas" name="direction" value="SELL">

1. 读、写一组参数对象
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

UI_DATAS 作为函数调用，可以直接读、写一组参数对象。

不传参数直接调用 ``UI_DATAS()`` 为读取页面全部参数。
==================================================

.. code-block:: javascript

    var params = UI_DATAS();
    /** 
    params = {
        instrument: 'SHFE.rb1801',
        volume: 20,
        direction: 'BUY'
    }
    **/

如果传入一个参数对象，即可更新页面的参数值。
==================================================

.. code-block:: javascript

    var params = { 
        "instrument" : "SHFE.rb1801",
        "direction" : "SELL",
        "volume" : 100
    }
    UI_DATAS(params); // 可以更新页面对应的数据

2. 读、写指定参数
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

UI_DATAS 用点操作符可以直接读写到对应的字段值。

读某个参数
==================================================

.. code-block:: javascript

    var instrument = UI_DATAS.instrument;
    // instrument = 'SHFE.rb1801'
    var volume = UI_DATAS.volume;
    // volume = 20
    var direction = UI_DATAS.direction;
    // direction = 'BUY'

写某个参数
==================================================

.. code-block:: javascript

    UI_DATAS.instrument = 'SHFE.rb1805';
    UI_DATAS.volume = 30;
    UI_DATAS.direction = 'SELL';
    // 页面对应数据更新
    