.. _3_function:

Task 结构说明
========================================

每个 Task 都是一个 Generator Function。

Generator 函数是 ES6 提供的一种异步编程解决方案，执行 Generator 函数会返回一个遍历器对象。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。

形式上，Generator 函数有两个特征。一是，function关键字与函数名之间有一个星号；二是，函数体内部使用 yield 表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）。

在天勤交易语法中，yield 后面返回的对象表示程序交易的状态。

客户端在每次收到服务器发来的数据包时，都会检查 yield 后面的条件，只要其中某个条件成立，程序即会继续运行到下一个 yield。


yield 返回数据的说明 

yield 返回的是一个对象，根据不同对象的类型，返回不同结果。

+ Function 返回函数执行结果

.. code-block:: javascript

    function* TaskQuote(C) {
        while (true) {
            var result = yield {
                QUOTE: function () { return C.GET_QUOTE(UI.instrument) },
            };
            /** js code **/
        }
    }

    // 如果传入条件是可执行的普通，则直接返回函数执行结果。在这里就是指定合约的行情。
    result.QUOTE = {
        instrument_id: ... ,
        ask_price1: ... , // 卖1价
        ask_volume1: ... , // 卖1量
        bid_price1: ... , // 买1价
        bid_volume1: ... , // 买1量
        last_price: ... // 最新价
        ....
    }

+ Task 返回 true / false， 返回 Task 是否已经执行完毕

.. code-block:: javascript

    function* TaskQuote(C) {
        TaskList = [];
        TaskList.push(START_TASK(TaskSingleOrder));
        TaskList.push(START_TASK(TaskSingleOrder));
        while (true) {
            var result = yield {
                ONE: START_TASK(TaskSingleOrder),
                TWO: TaskList,
            };
            /** js code **/
        }
    }

    // 得到返回的对象的数据结构, Task 对象返回 true/false
    result = {
        ONE: false,
        TWO: [true, false]
    } 

+ Array 返回数组，对应输入数组的位置

.. code-block:: javascript

    function* TaskQuote(C) {
        while (true) {
            var result = yield {
                QUOTE: [
                    function condA(){},
                    function condB(){}
                ],
            };
            /** js code **/
        }
    }

    // 得到返回的对象的数据结构, 数组顺序与传入的检查条件一一对应
    result.QUOTE = [,]

+ Object 返回对象，对应输入对象的键值

.. code-block:: javascript

    function* TaskQuote(C) {
        while (true) {
            var result = yield {
                QUOTE: {
                    condA: function (){},
                    condB: function (){},
                },
            };
            /** js code **/
        }
    }

    // 得到返回的对象的数据结构
    result.QUOTE = { 
        condA: ... ,
        condB: ...
    }
