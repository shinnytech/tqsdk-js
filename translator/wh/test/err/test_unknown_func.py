#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert
from wh.whconvert import wenhua_translate



class TestConvertIndicator(TestConvert):
    def test_unknown_func(self):
        case = {
            "id": "CASE",
            "cname": "CASE",
            "type": "MAIN",
            "src": """D:UNKFUNC(O, C, H);""",
            "params": [
            ],
            "expected": """""",
        }
        code, errors = wenhua_translate(case)
        print(errors)
        self.assertEqual(errors, [{'line': 1, 'col': 3, 'msg': "'UNKFUNC' 不是变量或函数名"}])

if __name__ == '__main__':
    unittest.main()

