#!/usr/bin/env python
#coding=utf-8

import unittest
from wh.test.base import TestConvert



class TestConvertIndicator(TestConvert):
    """
    VARIABLE:LOOKBACKDAYS:=0;
    定义变量
    """
    def test_dmi(self):
        case = {
            "id": "FUNC",
            "cname": "FUNC",
            "type": "SUB",
            "src": """
    VARIABLE:LOOKBACKDAYS:=0;
        """,
            "params": [
            ],
            "expected": """
            

            """,
        }

        self.assert_convert(case)


if __name__ == '__main__':
    unittest.main()
