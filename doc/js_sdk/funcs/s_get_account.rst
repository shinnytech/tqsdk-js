.. _s_get_account:

方法 C.GET_ACCOUNT
==================================

获取账户信息

.. js:function:: GET_ACCOUNT()

   :returns: 返回当前登录的账户对象。

示例
----------------------------------

.. code-block:: javascript

    function * Task(C){
        ...
        var account = C.GET_ACCOUNT();
        ...
    }