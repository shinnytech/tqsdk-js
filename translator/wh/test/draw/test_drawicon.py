#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    DRAWICON：绘制小图标。

    用法：
    DRAWICON(COND,PRICE,ICON);
    当COND条件满足时,在PRICE位置画图标ICON。

    注：
    1、该函数可以指定位置PRICE标注图标ICON
    2、ICON位置可以写成'ICON'的形式，也可以写为数字的形式，即DRAWICON(COND,PRICE,'ICON1');等价于DRAWICON(COND,PRICE,1);
    3、该函数可以用ALIGN，VALIGN设置图标的对齐方式。
    4、不支持将该函数定义为变量，即不支持下面的写法：
    A:DRAWICON(COND,PRICE,ICON);

    例1：
    DRAWICON(CLOSE<OPEN,LOW,'ICO1'),ALIGN2,VALIGN2;//在阴线的最低价上画出图标ICON1。图标右下对齐。
    写完“DRAWICON(CLOSE<OPEN,LOW,” 以后，点击插入图标按钮，再单击选中的图标插入到函数中，图标用'ICO1'~'ICO105'（或1~105）表示。

    例2：
    MA5:=MA(C,5);
    DRAWICON(C>MA5,MA5,2),ALIGN0,VALIGN0;//表示在收盘价大于5周期均线的k线对应的MA5数值位置上画出图标ICON2，图标左上对齐。
    写完“DRAWICON(C>MA5,MA5,” 以后，点击插入图标按钮，再单击选中的图标插入到函数中，图标用ICO1~ICO105（或1~105）表示。
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
        DRAWICON(CLOSE<OPEN,LOW,'ICO1'),ALIGN2,VALIGN2;
        MA5:=MA(C,5);
        DRAWICON(C>MA5,MA5,2),ALIGN0,VALIGN0;
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
let MA5 = [];
while(true){
let i = yield;
if((C.DS.close[i] < C.DS.open[i]))C.DRAW_ICON("ICON" + i, i, C.DS.low[i], ICON_BLOCK);
MA5[i]=MA(i, C.DS.close, 5, MA5);
if((C.DS.close[i] > MA5[i]))C.DRAW_ICON("ICON" + i, i, MA5[i], ICON_BLOCK);
}
}        
                 
            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
