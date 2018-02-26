.. _3_config:

关于界面的说明
=======================================

我们首先分析一下整个应用。

分析需求
---------------------------------------

我们把界面上的参数列出来：

+ 用户填写的参数

+------------+------------+--------------+
| name       | id         | default      |
+============+============+==============+
| 合约       | instrument | CFFEX.TF1803 |
+------------+------------+--------------+
| 手数       | volume     | 3            |
+------------+------------+--------------+
| 价格       | limit_price| 96           |
+------------+------------+--------------+

+ 点击按钮时，携带的参数

========== ========== ==========
button     direction  offset
========== ========== ==========
买开         BUY        OPEN
卖开         SELL       OPEN
买平         BUY        CLOSE
卖平         SELL       CLOSE
========== ========== ==========

在整个交易程序中，需要完成以下步骤：

1. 监听用户单击事件，获取用户交易买卖、开平的参数
2. 读取用户中页面上填写的其他参数
3. 根据这些参数，下单
4. 如果挂单交易完成，结束程序；如果用户单击结束按钮，撤单后结束程序


在页面上显示对应的 UI
---------------------------------------

界面关键代码

.. code-block:: html

    <input type="text" placeholder="合约代码" value="CFFEX.TF1803" id="instrument">

    <input type="number" placeholder="手数" value="3" id="volume">

    <input type="number" placeholder="价格" value="96" id="limit_price">

    <button type="button" class="START" data-direction="BUY" data-offset="OPEN">买开</button>
    <button type="button" class="START" data-direction="SELL" data-offset="OPEN">卖开</button>
    <button type="button" class="START" data-direction="BUY" data-offset="CLOSE">买平</button>
    <button type="button" class="START" data-direction="SELL" data-offset="CLOSE">卖平</button>

    <button type="button" class="STOP">停止</button>

.. hint::

    1. 所有标签的 id 不能重复，表示字段唯一标识。
    #. id 的设定只要符合 Javascript 变量名命名规则即可，这里为了提高代码的可读性和后续使用方便，命名和下单接口对应的字段 key 值相同。
    #. 默认值可以根据您的需要设定。
    #. input 标签 placeholder 表示显示的提示词，value 表示显示的默认值。
    #. button 用 data- 的表示数据， data-direction 表示方向，data-offset 表示开平。


页面上的控制按钮
---------------------------------------

.. code-block:: html

    <button type="button" id="START" data-direction="BUY" data-offset="OPEN">买开</button>

针对以上按钮，有两种监听按钮事件的方式：

1. 传统的 JQuery 方案
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    利用 JQuery 提供的 on 函数来监听事件。

.. code-block:: javascript

    $(function(){
        $('#START').on('click', function(){
            START_TASK(xxxtask);
        });
    });

2. 利用系统提供的 ON_CLICK 监听函数
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

在 Task 函数内部，则需要通过 C.ON_CLICK 监听按钮事件，返回的对象就是 data-xxx 构成的对象。

.. code-block:: javascript

    function* TaskOrder(C) {
        var wait = yield {
            'START': C.ON_CLICK('START'),
        }
        C.SET_STATE('START');

        var params = UI(); 
        params.direction = wait.START.direction; // "BUY"
        params.offset = wait.START.offset; // "OPEN"

        ......
    }

下一步
-------------------------------------------------------
下一步，开始完成编辑交易逻辑。

