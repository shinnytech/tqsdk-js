# -*- coding: utf8 -*-
__author__ = 'yangyang'

import json
import tornado.ioloop
import tornado.web
import tornado.httpserver
from wh import wenhua_translate


class WenhuaTranslate(tornado.web.RequestHandler):
    def post(self):
        s = self.request.body.decode("utf-8")
        print("input:", s)
        req = json.loads(s)
        ret = wenhua_translate(req)
        self.set_header("Access-Control-Allow-Origin", "*")
        print("output:", ret["target"])
        self.finish(ret)

    def options(self, *args, **kwargs):
        self.set_header("Access-Control-Allow-Origin", "*")
        self.finish()


class Application(tornado.web.Application):
    def __init__(self):
        handlers = [
            (r"/convert/wh", WenhuaTranslate),
        ]
        settings = {
        }
        tornado.web.Application.__init__(self, handlers, **settings)


if __name__ == "__main__":
    server_settings = {
        "xheaders": True,
    }
    application = Application()
    application.listen(8000, **server_settings)
    tornado.ioloop.IOLoop.instance().start()

