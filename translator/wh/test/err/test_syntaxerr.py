#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert
from wh.whconvert import wenhua_translate



class TestConvertIndicator(TestConvert):
    def test_unknown_char_0(self):
        case = {
            "id": "CASE",
            "cname": "CASE",
            "type": "MAIN",
            "src": """&D:MA(C, 5);""",
            "params": [
            ],
            "expected": """""",
        }
        code, errors = wenhua_translate(case)
        print(errors)
        self.assertEqual(errors, [{'line': 1, 'col': 1, 'msg': "不应该出现在这里的字符 '&'"}])

    def test_unknown_char_1(self):
        case = {
            "id": "CASE",
            "cname": "CASE",
            "type": "MAIN",
            "src": """
&D:MA(C, 5);""",
            "params": [
            ],
            "expected": """""",
        }
        code, errors = wenhua_translate(case)
        print(errors)
        self.assertEqual(errors, [{'line': 2, 'col': 1, 'msg': "不应该出现在这里的字符 '&'"}])

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
        self.assertEqual(errors, [{'line': 2, 'col': 1, 'msg': "不应该出现在这里的字符 '&'"}])

if __name__ == '__main__':
    unittest.main()

