.. _C.DRAW_TEXT:

C.DRAW_TEXT - 文字
=======================================
C.DRAW_TEXT 函数用于绘制文字

Example
--------------------------------------------------
.. code-block:: javascript

    function* draw (C) {
        C.DEFINE({
            type: "MAIN",
        });
        let color = new Color(0xaabbcc);
        while(true) {
            let i = yield;
            if(C.DS.close[i] > C.DS.open[i]){
                 C.DRAW_TEXT('id'+i, i, C.DS.low[i], '涨', color);
            }
        }
    }


Syntax
--------------------------------------------------
.. c:function:: C.DRAW_TEXT(id, x1, y1, text="", color=0xFFFFFF)

    绘制文字

    :param string id: 绘制文字 id
    :param number x1: 文字横坐标
    :param number y1: 文字纵坐标
    :param number text: 文字内容
    :param color: 文字颜色（详情见下表 :ref:`C.DRAW_TEXT-color`）
    :type color: number or Color
    :return: null

.. tip::
    K 线图上的坐标横轴用 K 线 ID 号表示，纵轴坐标就是当前图表的纵坐标。


.. _C.DRAW_TEXT-color:

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

