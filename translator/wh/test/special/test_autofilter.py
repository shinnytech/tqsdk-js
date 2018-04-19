#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    AUTOFILTER 启用一开一平信号过滤机制。

    用法：
    模型中含有AUTOFILTER函数，则启用一开一平信号过滤机制。
    模型中不写入该函数，则每个指令都有效，支持加减仓。

    模型的过滤规则：
    1、连续的同方向指令只有第一个有效，其他的将被过滤；
    2、交易指令必须先开仓后平仓，一开一平配对出现：
    出现BK指令，下一个指令只允许出现SP\SPK指令；
    出现SK指令，下一个指令只允许出现BP\BPK指令；
    出现SP/BP/CLOSEOUT等平仓指令，下一个可以是BK/SK/SPK/BPK指令任一个；
    反手指令SPK和BPK交叉出现。

    例：
    CLOSE>OPEN,BK;
    CLOSE<OPEN,SP;
    AUTOFILTER; //启用一开一平信号过滤机制

    方案:
        JS端实现指标OPTION, 由JS端框架使用
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
        AUTOFILTER;
        """,
            "params": [
            ],
            "expected": """

function* FUNC(C){
C.DEFINE({
type: "SUB",
cname: "FUNC",
state: "KLINE",
occycle: 1,
yaxis: [],
});
//定义指标参数

//输入序列

//输出序列

//临时序列

//指标计算
while(true){
let i = yield;

}
}        
          
          """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
