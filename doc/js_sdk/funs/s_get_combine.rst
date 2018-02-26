.. _s_get_combine:

方法 GET_COMBINE 
==================================

获取用户自定义组合信息

.. js:function:: GET_COMBINE(combine_name, from)

    :param string combine_name: 自定义组合的名称。
    :param object from: 数据源
    :returns: 返回用户自定义组合信息。


数据源
----------------------------------

+------------------------+------------+--------------+
| from                   | id         | default      |
+========================+============+==============+
| Ctx.LATEST_DATA        | instrument | CFFEX.TF1803 |
+------------------------+------------+--------------+
| Ctx.LAST_UPDATED_DATA  | volume     | 3            |
+------------------------+------------+--------------+


示例
----------------------------------

.. code-block:: javascript

    function * Task(C){
        ...
        var weights = C.GET_COMBINE('rr', C.LAST_UPDATED_DATE);
        ...
    }