.. _task:

Task 单线程多任务框架
========================================

多任务问题
----------------------------------------
对于用户而言, 一个任务中通常包含了若干操作和等待, 以一个简单的止损需求为例:

+ 发出一个买入开仓报单指令
+ 如果报单完全成交, 则:
  - 等待价格跌破 开仓价 - 30 元, 一旦条件满足, 立即发出一个平仓指令
+ 如果用户撤销了报单, 则任务结束

在这个例子中, 等待发出的开仓指令成交, 和等待价格满足预设条件, 都需要等待一段较长的时间, 在这段时间内, 我们可能还有别的策略需要运行, 因此需要某种多任务机制, 来使多个任务同时执行. 常见的多任务方案有三种


异步回调+状态机模型
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
CTP API 使用的即是此方式. 每当一个事件发生时, 触发特定的回调函数. 用户在回调函数中编写自己的业务代码对事件进行响应.

Pros:

* 语法简单, 绝大多数编程语言都直接支持此类模型, 性能较高

Cons:

* 用户的业务代码被分成两个(或更多)部分, 一部分代码在主线程中执行, 另一部分代码放在回调函数中, 代码结构与需求结构不一致, 导致编码困难
* 当业务逻辑较复杂时, 需要用户自行构建状态机和管理状态变量
* 主线程和回调函数线程中的代码如果常常需要访问共同变量, 因此需用户实现转线程或线程锁机制


多线程阻塞模型
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
每个任务建立一个线程, 在线程中可以方便的执行阻塞和等待.

Pros:

* 代码结构与需求结构较为接近, 编码较简单
* 所有业务代码可以组织到一个函数中, 避免状态机和全局变量

Cons:

* 多线程都对共同数据集执行读写操作, 需要小心的使用锁机制
* 线程开销较大, 创建大量线程后性能明显下降


基于generator机制的单线程多任务模型
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
为了克服上面两种机制的困难, 现代编程语言中通常都支持某种形式的 单线程多任务 机制, 例如 golang 中的 coroutines, javascript 和 python 中的 generator 等.

Pros:

* 代码结构与线程函数相似, 所有业务代码可以组织到一个函数中, 避免状态机和全局变量
* 代码中明确插入等待事件的代码, 任务管理器只会在这个位置执行任务切换
* 多任务访问共同变量无需加锁
* 没有线程开销

Cons:

* 较老的编程语言对此机制缺乏支持
* 程序员经验较少

我们推荐使用这种模型, 并在 TQSDK 中对这种方式给予了专门支持


Task 概念
----------------------------------------
我们将一个任务称为一个 task. 在实现上, 每个task是一个 javascript generator function.

Generator 函数是 ES6 提供的一种异步编程解决方案，执行 Generator 函数会返回一个遍历器对象。返回的遍历器对象，可以依次遍历 Generator 函数内部的每一个状态。

形式上，Generator 函数有两个特征。一是，function关键字与函数名之间有一个星号；二是，函数体内部使用 yield 表达式，定义不同的内部状态（yield在英语里的意思就是“产出”）。

.. code-block:: javascript

    function* TaskName(C [, options] ) {
        ...
        var result = yield {}
        ...
        return;
    }

.. code-block:: javascript

    function* TaskQuote(C) {
        while (true) {
            var result = yield {
                UPDATED_QUOTE: function () { return C.GET_QUOTE(UI.instrument) },
                CHANGED: C.ON_CHANGE('instrument')
            };
            var quote = C.GET_QUOTE(UI.instrument);
            UI(quote); // 更新界面
        }
    }

.. note::
- 形式上，关键字 ``function`` 和函数名中间必须有一个 ``*``。
    - 函数的参数，第一个参数为系统提供的环境，以及生成任务时传入的参数。
    - 关键字 ``yield`` 表示，函数在执行到这里时，会检查后面对象表示出的条件，并以对象形式返回，后面代码中就可以根据返回的内容执行不同的逻辑。
    - 关键字 ``return`` 表示函数执行完毕。

上面代码展示了一个简单的task.


任务管理器与任务调度
----------------------------------------
TQSDK 中实现了一个任务管理器, 来负责管理task的生存周期和CPU切换.

Task的启动和停止
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
系统提供了 4 个函数操作 Task

===========  =====
function     操作
===========  =====
START_TASK   开始
PAUSE_TASK   暂停
RESUME_TASK  恢复
STOP_TASK    结束
===========  =====

可以在任意位置开始、结束、暂停、恢复一个 Task，但是已经结束的 Task 无法恢复运行。可以选择重新开始一个 Task。


在Task的嵌套调用
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. code-block:: javascript

    function* TaskParent() {
        // do something
        // ...
        // start two child task
        let task_child_1 = START_TASK(TaskChild);
        let task_child_2 = START_TASK(TaskChild);
        // wait until child tasks finish or user clicked stop
        let wait_result = yield {
            SUBTASK_COMPLETED: [task_child_1, task_child_2],  //All sub task finished
            USER_CLICK_STOP: C.ON_CLICK('STOP') //User clicked stop button
        };
    }

    function* TaskChild() {
        // do something
    }

.. hint::

    yield 后面如果是 Task 对象的话，返回的内容会是 true / false 。

    如果子 Task 已经执行完毕，返回 true， 否则返回 false。


在Task中实现异步等待
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
