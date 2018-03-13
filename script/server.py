# -*- coding: utf8 -*-
__author__ = 'yangyang'

import json
import logging
import tornado.ioloop
import tornado.web
import tornado.httpserver
from wh import wenhua_translate, TranslateException

logging.basicConfig(
    level=logging.INFO,
    # filename="/var/log/tatranslator.log",
    filename="c:\\tmp\\tatranslator.log",
    # filemode="w",
    format='%(asctime)-15s %(message)s'
)
logger = logging.getLogger()


class WenhuaTranslate(tornado.web.RequestHandler):
    def post(self):
        s = self.request.body.decode("utf-8")
        logger.info("wenhua translate start, input=%s", s)
        req = json.loads(s)
        self.set_header("Access-Control-Allow-Origin", "*")
        try:
            ret = wenhua_translate(req)
            logger.info("wenhua translate success, output=%s", json.dumps(ret, indent=2))
            self.finish({
                "errline": 0,
                "errcol": 0,
                "errvalue": "",
                "target": ret,
            })
        except TranslateException as e:
            logger.warning("wenhua translate fail, %s", e)
            self.finish({
                "errline": e.err_line,
                "errcol": e.err_col,
                "errvalue": e.err_msg,
                "target": "",
            })
        except Exception as e:
            logger.warning("wenhua translate fail, %s", e)
            self.finish({
                "errline": -1,
                "errcol": -1,
                "errvalue": str(e),
                "target": "",
            })

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
