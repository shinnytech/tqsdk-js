.. _s_set_state:

方法 C.SET_STATE 
==================================

.. js:function:: SET_STATE(state)

   设置运行任务的状态。任务在设置运行状态后，界面 UI 会处于禁用状态，不能修改参数。

   :param string state: state 共有4种取值 ("START"|"PAUSE"|"RESUME"|"STOP")
   :returns: null