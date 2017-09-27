var TM = function () {
    function tm_init(content) {
        //更新所有指标类定义, 并发送到主进程
        for (var func_name in content) {
            if (G_Error_Class_Name.indexOf(func_name) > -1) {
                continue;
            }
            tm_init_one(content[func_name]);
        }
    }

    function tm_init_one(indicator) {
        var func_name = indicator.name;
        var code = indicator.draft.code;
        try {
            if (indicator.type !== 'custom_wh') {
                eval(func_name + ' = ' + code);
                tm_update_class_define(self[func_name]);
            } else {
                var req = covertWHRequest(indicator);
                if (req === null) return;
                fetch('http://192.168.1.80:8000/convert/wh', {
                    method: 'POST',
                    body: JSON.stringify(req)
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.errline === 0) {
                            eval(func_name + ' = ' + data.target);
                            tm_update_class_define(self[func_name]);
                        } else if (data.errline === -1) {
                            postMessage({
                                cmd: 'feedback', content: {
                                    error: true,
                                    type: 'eval',
                                    message: 'error in end of file',
                                    func_name: func_name
                                }
                            });
                        } else {
                            postMessage({
                                cmd: 'feedback', content: {
                                    error: true,
                                    type: 'eval',
                                    message: 'error in ' + data.errline + ':' + data.errcol + ' ' + data.errvalue,
                                    func_name: func_name
                                }
                            });
                        }
                    })
                    .catch(error => {
                        postMessage({
                            cmd: 'feedback', content: {
                                error: true,
                                type: 'eval',
                                message: 'wh' + error.message,
                                func_name: func_name
                            }
                        });
                    });
            }
        } catch (e) {
            postMessage({
                cmd: 'feedback', content: {
                    error: true,
                    type: 'eval',
                    message: e.message,
                    func_name: func_name
                }
            });
            return;
        }
    }

    function covertWHRequest(indicator) {
        let type = 'MAIN';
        switch (indicator.prop) {
            case "K线附属指标":
                type = 'MAIN';
                break;
            case "副图指标":
                type = 'SUB';
                break;
            case "主图K线形态":
                type = 'MAIN';
                postMessage({
                    cmd: 'feedback', content: {
                        error: true,
                        type: 'define',
                        message: '未实现 主图K线形态',
                        func_name: indicator.name
                    }
                });
                return null;
        }
        let params = [];
        for (let i = 1; i <= 6; i++) {
            let p = indicator.params[i];
            if (p && p.name)
                params.push([p.name, Number(p.min), Number(p.max), Number(p.default_value)]);
        }
        return {
            id: indicator.name, //指标函数名
            cname: indicator.name, //指标中文名称
            type: type, //指标类型, MAIN=主图指标, SUB=副图指标
            params: params,
            src: indicator.draft.code //文华原代码
        }
    }

    function tm_update_class_define(ta_func) {
        var indicator_name = ta_func.name;

        //调用指标函数，提取指标信息
        var params = new Map();
        var input_serials = new Map();
        var output_serials = new Map();
        //在global环境中准备全部的系统函数
        var ta_class_define = {
            "name": indicator_name,
            "cname": indicator_name,
            "type": "SUB",
            "state": "KLINE",
            "yaxis": [{id: 0}],
            "params": [],
        };
        var C = {};
        C.DEFINE = function (options) {
            if (!(options === undefined)) {
                Object.assign(ta_class_define, options);
            }
        };
        C.PARAM = function (param_default_value, param_name, options) {
            var param_define = params.get(param_name);
            if (param_define === undefined) {
                param_define = {
                    name: param_name,
                    default: param_default_value,
                };
                if (typeof param_default_value === "string") {
                    param_define.type = "STRING";
                } else if (typeof param_default_value === "number") {
                    param_define.type = "NUMBER";
                } else if (param_default_value instanceof COLOR) {
                    param_define.type = "COLOR";
                }
                if (options !== undefined) {
                    param_define.memo = options.MEMO;
                    param_define.min = options.MIN;
                    param_define.max = options.MAX;
                    param_define.step = options.STEP;
                }
                params.set(param_name, param_define);
            }
            return param_default_value;
        };
        C.SERIAL = () => {
        };
        C.OUT = () => {
        };
        C.OUTS = function (style, serial_name, options) {
            if (style === "KLINE")
                return [null, null, null, null];
            else
                return null;
        };
        C.CALC_LEFT = 0;
        C.CALC_RIGHT = 0;

        var id = Keys.next().value;
        postMessage({
            cmd: 'calc_start', content: {
                id: id,
                className: indicator_name
            }
        });
        try {
            var f = ta_func(C);
            f.next();
        }
        catch (e) {
            postMessage({
                cmd: 'calc_end', content: {
                    id: id,
                    className: this.ta_class_name
                }
            });
            postMessage({
                cmd: 'feedback', content: {
                    error: true,
                    type: 'define',
                    message: e.message,
                    func_name: indicator_name
                }
            });
            return;
        }
        postMessage({
            cmd: 'calc_end', content: {
                id: id,
                className: this.ta_class_name
            }
        });
        postMessage({
            cmd: 'feedback', content: {
                error: false,
                type: 'define',
                message: 'success',
                func_name: indicator_name
            }
        });

        //指标信息格式整理
        params.forEach(function (value, key) {
            ta_class_define["params"].push(value)
        });
        ta_class_define.aid = "register_indicator_class";
        //发送指标类信息到主进程
        WS.sendJson(ta_class_define);
    }

    return {
        sendIndicatorClassList: tm_init,
        sendIndicatorClass: tm_init_one
    };
}();
