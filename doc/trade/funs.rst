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

INIT_UI
------------------------------

UPDATE_DATAS
------------------------------

ENABLE_INPUTS
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
