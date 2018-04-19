# -*- coding: utf8 -*-
__author__ = 'yangyang'

import json
import logging


translate_error_list = []


def clear_error():
    global translate_error_list
    translate_error_list = []


def add_error(line, col, msg):
    global translate_error_list
    translate_error_list.append({
        "line": line,
        "col": col,
        "msg": msg,
    })


def get_errors():
    global translate_error_list
    return translate_error_list

def print_errors():
    global translate_error_list
    for item in translate_error_list:
        print(item)