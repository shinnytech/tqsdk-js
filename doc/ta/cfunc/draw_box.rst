.. _C.DRAW_BOX:

C.DRAW_BOX - 矩形框（空心，只画边线）
=======================================
C.DRAW_BOX 函数用于绘制矩形框（空心，只画边线）

Example
--------------------------------------------------
.. code-block:: javascript

    function* draw (C) {
        C.DEFINE({
            type: "MAIN",
        });
        let n0 = C.PARAM(5, "N" ); // 计算周期
        // 最近5个周期内最高最低价覆盖的矩形框
        while(true) {
            let i = yield;
            let high = HIGHEST(i, C.DS.high, n0);
            let low = LOWEST(i, C.DS.low, n0);
            C.DRAW_BOX('box', i-n0+1, high, i, low, RED, 1, 1);
        }
    }


Syntax
--------------------------------------------------
.. c:function:: C.DRAW_BOX(id, x1, y1, x2, y2, color=0xFFFFFF, width=1, style=0)

    绘制矩形框

    :param string id: 绘制图形 id
    :param number x1: 矩形左上角横坐标
    :param number y1: 矩形左上角纵坐标
    :param number x2: 矩形右下角横坐标
    :param number y2: 矩形右下角纵坐标
    :param color: 矩形框颜色
    :type color: number or Color（详情见下表 :ref:`C.DRAW_BOX-color`）
    :param number width: 矩形框线粗度
    :param number style: 矩形框线线型（详细选项见下表 :ref:`C.DRAW_BOX-style`）
    :return: null


.. tip::
    K 线图上的坐标横轴用 K 线 ID号表示，纵轴坐标就是当前图表的纵坐标。


.. _C.DRAW_BOX-color:

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


.. _C.DRAW_BOX-style:

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

