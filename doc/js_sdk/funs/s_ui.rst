.. _s_ui:

UI
==================================

UI 部分，UI 用于读取页面填写的参数，或者在页面上填写指定数据。需要在 html 标签的 class 属性添加 tq-datas。

.. code-block:: html

    <input type="text" class="form-control tq-datas" id="instrument" placeholder="合约代码" value='SHFE.rb1801'>
    <input type="number" class="form-control tq-datas" id='volume' value="60">

    <input type="radio" class="tq-datas" name="direction" value="BUY" checked>
    <input type="radio" class="tq-datas" name="direction" value="SELL">

UI 读、写一组参数对象
------------------------------------

UI 作为函数调用，可以直接读、写一组参数对象。

+ 不传参数直接调用 ``UI()`` 为读取页面全部参数。

.. code-block:: javascript

    var params = UI();
    /** 
    params = {
        instrument: 'SHFE.rb1801',
        volume: 20,
        direction: 'BUY'
    }
    **/

+ 如果传入一个参数对象，即可更新页面的参数值。

.. code-block:: javascript

    var params = { 
        "instrument" : "SHFE.rb1801",
        "direction" : "SELL",
        "volume" : 100
    }
    UI(params); // 可以更新页面对应的数据

UI 读、写指定参数
------------------------------------

UI 用点操作符可以直接读写到对应的字段值。

+ 读某个参数

.. code-block:: javascript

    var instrument = UI.instrument;
    // instrument = 'SHFE.rb1801'
    var volume = UI.volume;
    // volume = 20
    var direction = UI.direction;
    // direction = 'BUY'

+ 写某个参数

.. code-block:: javascript

    UI.instrument = 'SHFE.rb1805';
    UI.volume = 30;
    UI.direction = 'SELL';
    // 页面对应数据更新
    