# -*- coding: utf8 -*-
__author__ = 'yangyang'

import json
import tornado.ioloop
import tornado.web
import tornado.httpserver
from wh import wenhua_translate


class WenhuaTranslate(tornado.web.RequestHandler):
    def post(self):
        req = json.loads(self.request.body.decode("utf-8"))
        ret = wenhua_translate(req)
        self.finish(ret)


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

