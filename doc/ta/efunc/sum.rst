.. _SUM:

SUM - 求序列中连续N项和
==================================================
SUM函数用于求一个序列中连续N项的和

Example
--------------------------------------------------
.. code-block:: javascript

    s1[i] = SUM(i, s, n1, s1);

Syntax
--------------------------------------------------
.. c:function:: SUM(i, serial, n, [cache])

   求序列serial中i前n项(包含第i项, 即第i项, 第i-1项, ..., 第i-n+1项)的和

   :param int i: 必填，指定序列位置
   :param Array serial: 必填，需要求值的序列
   :param int n: 必填，求值范围为从i开始往左的n项(包含第i项)
   :param Array cache: 可选, 将输出结果序列填在此处可以优化性能
   :type options: object or undefined
   :return: 计算出的和
   :rtype: float


Remarks
--------------------------------------------------


Source
--------------------------------------------------
.. code-block:: javascript

    function SUM(i, serial, n, cache) {
        if (cache === undefined || cache.length == 0 || isNaN(cache[i - 1]))
            return _sum(serial, n, i);
        return cache[i - 1] - serial[i - n] + serial[i];
    }

    function _sum(serial, n, p) {
        var s = 0;
        for (var i = p - n + 1; i <= p; i++) {
            s += serial[i];
        }
        return s;
    }

