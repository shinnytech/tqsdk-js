#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert
from wh.whconvert import wenhua_translate



class TestConvertIndicator(TestConvert):
    def test_trade(self):
        case = {
            "id": "fxp",
            "cname": "fxp",
            "type": "MAIN",
            "src": """D:UNKFUNC(O, C, H);""",
            "params": [
            ],
            "expected": """""",
        }
        with self.assertRaises(SyntaxError):
            actual = wenhua_translate(case)

if __name__ == '__main__':
    unittest.main()

