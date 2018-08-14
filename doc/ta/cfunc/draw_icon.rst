.. _C.DRAW_ICON:

C.DRAW_ICON - 图标
=======================================
C.DRAW_ICON 函数用于绘制图标

Example
--------------------------------------------------
.. code-block:: javascript

    function* draw (C) {
        C.DEFINE({
            type: "MAIN",
        });
         //参数
        let n1 = C.PARAM(3, "N1");
        let n2 = C.PARAM(10, "N2");
        //输出序列
        let s1 = C.OUTS("LINE", "ma" + n1, {color: RED});
        let s2 = C.OUTS("LINE", "ma" + n2, {color: GREEN});
        while(true) {
            let i = yield;
            s1[i] = MA(i, C.DS.close, n1, s1); // n1周期均线
            s2[i] = MA(i, C.DS.close, n2, s2); // n2周期均线
            if( s1[i] > s2[i] &&  s1[i-1] <= s2[i-1] ){ //短均线上穿长均线
                C.DRAW_ICON('id'+i, i, C.DS.low[i], 1);
            }
            if( s1[i] < s2[i] &&  s1[i-1] >= s2[i-1] ){ //短均线下穿长均线
                C.DRAW_ICON('id'+i, i, C.DS.high[i], 2);
            }
        }
    }


Syntax
--------------------------------------------------
.. c:function:: C.DRAW_ICON(id, x1, y1, icon)

    绘制图标

    :param string id: 绘制图形 id
    :param number x1: 图标横坐标
    :param number y1: 图标纵坐标
    :param number icon: 图标类型（支持类型见下表 :ref:`C.DRAW_ICON-icon`）
    :return: null

.. tip::
    K 线图上的坐标横轴用 K 线 ID 号表示，纵轴坐标就是当前图表的纵坐标。

.. _C.DRAW_ICON-icon:

icon
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
=================== =================================================================================
Value	            Value/Description
=================== =================================================================================
1                    买位置图标
2                    卖位置图标
=================== =================================================================================
