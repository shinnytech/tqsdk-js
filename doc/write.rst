技术指标
=======================================

概述
--------------------------------------------------
本软件支持用户以三种方式创建自定义技术指标。这三种方式创建的技术指标在使用时是完全一致的。

* 用 javascript 语言编写技术指标
* 转换其它语言格式的技术指标到天勤的语法格式
* 通过websocket接口，外挂指标计算扩展模块


用javascript语言编写技术指标
--------------------------------------------------
一个MA的例子：

.. code-block:: javascript
   :caption: ma指标示例

    function ma(C) {
        C.DEFINE({TYPE: IKLINE, YAXIS: YAXIS_DEFAULT});
        var n = C.PARAM(10, "N");
        var v = 0;
        for (var i=C.CALC_LEFT; i<=C.CALC_RIGHT; i++){
            var v = MA(SERIAL("close"), n);
            C.OUT_LINE(v, "ma", {COLOR: RED, WIDTH: 3});
        }
    };

* 每个技术指标都是一个函数，函数名即为指标名
* 指标函数只有一个参数C，里面包含了所有的系统变量和系统函数

C.DEFINE()
C需要一套文档描述
DEFINE:


define 标志:
{
    KLINE: true,
    TICK: true,
    INDAY: true,
    
    STYLE: MAIN / SUB, 主图指标
    YAXIS: {
        ID: 0,
        TOP: NAN, / some number,
        MID: NAN, / ...,
        BOTTOM: NAN, / ...,
        FORMAT: AUTO / PRICE / PERCENT / NUMBER,
    }
}


系统函数
--------------------------------------------------
所有系统函数都作为C的成员函数提供.

.. c:function:: DEFINE(options)

   定义指标信息

   :param options: 一个包含dict
   :type value: 数值 或 function(p)
   :param str recipient: The recipient of the message
   :param str message_body: The body of the message
   :param priority: The priority of the message, can be a number 1-5
   :type priority: integer or None

   
PARAM：
    定义指标/提取指标值

SERIAL：
    提取序列

OUT:
    输出序列值

每个序列的option:
{
    YAXIS: 0, //指定Y轴
    RANGE: true, //是否参与range计算, 默认值为true
    ALIGN: NONE / POINT / PERCENT / PRICE //主图指标专用, 表示指标与主K线的左端对齐
}    

.. c:function:: OUTS(value, name, options)

   Send a message to a recipient

   :param value: The person sending the message
   :type value: 数值 或 function(p)
   :param str recipient: The recipient of the message
   :param str message_body: The body of the message
   :param priority: The priority of the message, can be a number 1-5
   :type priority: integer or None
   :return: the message id
   :rtype: int


.. c:function:: OUTS(value, name, options)

   Send a message to a recipient

   :param value: The person sending the message
   :type value: 数值 或 function(p)
   :param str recipient: The recipient of the message
   :param str message_body: The body of the message
   :param priority: The priority of the message, can be a number 1-5
   :type priority: integer or None
   :return: the message id
   :rtype: int
   :raises ValueError: if the message_body exceeds 160 characters
   :raises TypeError: if the message_body is not a basestring
   
    

DATALEFT/DATARIGHT:
    数据区左值，右值

CALC_LEFT/CALC_RIGHT:
    计算区左端点ID，右端点ID


    var vshort = C.PARAM(20, "SHORT", {MIN: 5, STEP: 5});
    var vlong = C.PARAM(35, "LONG", {MIN: 5, STEP: 5});
    var vm = C.PARAM(10, "M", {MIN: 5, STEP: 5});
    //计算
    var sclose = C.SERIAL("CLOSE");
    var s1 = EMA(sclose, vshort);
    var s2 = EMA(sclose, vlong);
    var diff = (p) => (s1(p) - s2(p));
    // var diff = (p) => (EMA(sclose, vshort)(p) - EMA(sclose, vlong)(p));
    var dea = EMA(diff, vm);
    var bar = (p) => (2*(diff(p) - dea(p)));
    //输出
    for(var i=C.CALC_LEFT; i<=C.CALC_RIGHT; i++){
        var d = diff(i);
        C.OUT(i, d, "diff", {});
        C.OUT(i, dea(i), "dea", {});
        C.OUT(i, bar(i), "bar", {});
    }
