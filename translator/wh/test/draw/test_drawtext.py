#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert


class TestConvertIndicator(TestConvert):
    """
    DRAWTEXT：显示文字。

    用法：
    1、DRAWTEXT(COND,PRICE,TEXT);
    当COND条件满足时,在PRICE位置书写文字TEXT。
    2、DRAWTEXT(COND,PRICE,TEXT,COLOR);
    当COND条件满足时,在PRICE位置书写文字TEXT,文字颜色为COLOR。

    注：
    1、显示的汉字用单引号标注
    2、该函数可以用ALIGN，VALIGN设置文字的对齐方式。
    3、该函数可以用FONTSIZE设置文字显示的字体大小
    4、该函数可以用COLOR设置文字的颜色，即该函数支持如下写法：DRAWTEXT(COND,PRICE,TEXT),COLOR;

    例1：
    DRAWTEXT(CLOSE<OPEN&&REF(CLOSE,1)<REF(OPEN,1)&&REF(VOL,1)*1.1<VOL,LOW,'注');//
    表示连续两日收阴并且成交量比前一日至少多10%时，在最低价上写"注"字。
    例2：
    DRAWTEXT(L<=LLV(L,10),LOW,'新低'),ALIGN0,FONTSIZE16,COLORRED;//表示当根k线创10周期新低时，在最低价写"新低"字，文字左对齐，字体大小为16，文字颜色为红色。

    方案:
        协议中增加字符串内容
        发出方不难, 接收方要解码和存储有困难,需重构
    """
    def test_func(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
        DRAWTEXT(CLOSE<OPEN&&REF(CLOSE,1)<REF(OPEN,1)&&REF(VOL,1)*1.1<VOL,LOW,'注');//
        DRAWTEXT(L<=LLV(L,10),LOW,'新低'),ALIGN0,FONTSIZE16,COLORRED;//表示当根k线创10周期新低时，在最低价写"新低"字，文字左对齐，字体大小为16，文字颜色为红色。
        """,
            "params": [
            ],
            "expected": """
            
function* FUNC(C){
C.DEFINE({
type: "SUB",
cname: "FUNC",
state: "KLINE",
yaxis: [],
});
while(true){
let i = yield;
if((((C.DS.close[i] < C.DS.open[i]) && (REF(i, C.DS.close, 1) < REF(i, C.DS.open, 1))) && ((REF(i, C.DS.volume, 1) * 1.1) < C.DS.volume[i])))C.DRAW_TEXT("TEXT" + i, i, C.DS.low[i], '注', WHITE);
if((C.DS.low[i] <= LOWEST(i, C.DS.low, 10)))C.DRAW_TEXT("TEXT" + i, i, C.DS.low[i], '新低', RED);
}
}        

            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
