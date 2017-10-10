.. _STDEV:

STDEV - 求序列中连续N项标准差
=======================================
STDEV函数用于求一个序列中连续N项的标准差

Example
--------------------------------------------------
.. code-block:: javascript

    s1[i] = STDEV(i, s, n1, s1);


Syntax
--------------------------------------------------
.. c:function:: STDEV(i, serial, n, [cache])

   求序列serial中i前n项(包含第i项, 即第i项, 第i-1项, ..., 第i-n+1项)的标准差

   :param int i: 必填，指定序列位置
   :param Array serial: 必填，需要求值的序列
   :param int n: 必填，求值范围为从i开始往左的n项(包含第i项)
   :param Array cache: 可选, 将输出结果序列填在此处可以优化性能
   :return: 计算出的标准差
   :rtype: float


Remarks
--------------------------------------------------



Source
--------------------------------------------------
.. code-block:: javascript

    function STDEV(i, serial, n, cache) {
        let s = cache.s ? cache.s : [];
        let x2 = 0;
        let x = 0;
        if (s.length == 0 || !(i - 1 in s)) {
            for (let k = i - n + 1; k <= i; k++) {
                let d = serial[k];
                x2 += d * d;
                x += d;
            }
        } else {
            x = s[i - 1] - serial[i - n] + serial[i];
            x2 = s[i - 1] - serial[i - n] * serial[i - n] + serial[i] * serial[i];
        }
        let std = Math.sqrt((x2 - x * x / n) / n);
        if (!isNaN(std)) {
            s[i] = [x, x2];
        }
        return std;
    }
