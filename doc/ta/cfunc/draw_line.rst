.. _C.DRAW_LINE:

C.DRAW_LINE - 直线
=======================================
C.DRAW_LINE 函数用于绘制直线


Example
--------------------------------------------------
.. code-block:: javascript

    function* drawline (C) {
        C.DEFINE({
            type: "MAIN",
        });
        while(true) {
            let i = yield;
            C.DRAW_LINE('line1', i-20, C.DS.close[i-20], i, C.DS.high[i], WHITE, 2, 0);
        }
    }


Syntax
--------------------------------------------------
.. c:function:: C.DRAW_LINE(id, x1, y1, x2, y2, color=0xFFFFFF, width=1, style=0)

    定义直线属性，通过 A、B 两点确定一条直线

    :param string id: 绘制直线 id
    :param number x1: 直线 A 点横坐标
    :param number y1: 直线 A 点纵坐标
    :param number x2: 直线 B 点横坐标
    :param number y2: 直线 B 点纵坐标
    :param color: 直线颜色
    :type color: number or Color（详情见下表 :ref:`C.DRAW_LINE-color`）
    :param number width: 直线粗度
    :param number style: 直线线型（详细选项见下表 :ref:`C.DRAW_LINE-style`）
    :return: null


.. tip::
    K 线图上的坐标横轴用 K 线 ID号表示，纵轴坐标就是当前图表的纵坐标。


.. _C.DRAW_LINE-color:

color
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

系统中已定义的常量颜色：

+ RED
+ GREEN
+ BLUE
+ CYAN
+ BLACK
+ WHITE
+ GRAY
+ MAGENTA
+ YELLOW
+ LIGHTGRAY
+ LIGHTRED
+ LIGHTGREEN
+ LIGHTBLUE

可以直接使用上面这些颜色常量，也可以自己定义颜色：

.. code-block:: javascript

    /**
     * 支持三种新建形式
     * new Color(r, g, b); //
     * new Color(0xFF0000);
     * new Color("#FFFF00");
     */
    // 例如
    let color1 = new Color(0xFF, 0, 0);
    let color2 = new Color(0xFF0000);
    let color3 = new Color("#00FF00");


.. _C.DRAW_LINE-style:

style
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
=================== ===================== ===========================================================
Value	            Description            Demo
=================== ===================== ===========================================================
0                    默认，SOLID（实线）
1                    DASH（虚线）           `-------`
2                    DOT（点线）            `.......`
3                    DASHDOT               `_._._._`
4                    DASHDOTDOT            `_.._.._`
=================== ===================== ===========================================================

