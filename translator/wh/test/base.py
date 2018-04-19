#!/usr/bin/env python
#coding=utf-8

import logging
import unittest

from wh.whconvert import wenhua_translate


class TestConvert(unittest.TestCase):
    def assert_convert(self, case):
        logger = logging.getLogger()
        logger.setLevel(logging.DEBUG)
        actual_code, errors = wenhua_translate(case)
        print(actual_code)
        expected = case["expected"]
        self.assert_text_equal(expected, actual_code)

    def assert_text_equal(self, a, b):
        self.maxDiff = None
        a = a.translate({ord(c): None for c in '\r\n\t '})
        b = b.translate({ord(c): None for c in '\r\n\t '})
        self.assertEqual(a, b)

if __name__ == '__main__':
    unittest.main()
