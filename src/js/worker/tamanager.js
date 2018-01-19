const TM = (function () {
    function init(content) {
        //更新所有指标类定义, 并发送到主进程
        for (let funcName in content) {
            if (G_ERRORS.indexOf(funcName) > -1) {
                continue;
            }

            initOne(content[funcName]);
        }
    }

    function initOne(indicator) {
        let funcName = indicator.name;
        let code = indicator.draft.code;
        try {
            if (indicator.type !== 'custom_wh') {
                eval(funcName + ' = ' + code);
                updateClassDefine(self[funcName]);
            } else {
                let req = covertWHRequest(indicator);
                if (req === null) return;
                fetch('http://127.0.0.1:8000/convert/wh', {
                    method: 'POST',
                    body: JSON.stringify(req),
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.errline === 0) {
                            eval(funcName + ' = ' + data.target);
                            updateClassDefine(self[funcName]);
                        } else if (data.errline === -1) {
                            postMessage({
                                cmd: 'feedback', content: {
                                    error: true,
                                    type: 'eval',
                                    message: 'error in end of file',
                                    func_name: funcName,
                                },
                            });
                        } else {
                            postMessage({
                                cmd: 'feedback', content: {
                                    error: true,
                                    type: 'eval',
                                    message: `error in ${data.errline}:${data.errcol} ${data.errvalue}`,
                                    func_name: funcName,
                                },
                            });
                        }
                    })
                    .catch(error => {
                        postMessage({
                            cmd: 'feedback', content: {
                                error: true,
                                type: 'eval',
                                message: error.message,
                                func_name: funcName,
                            },
                        });
                    });
            }
        } catch (e) {
            postMessage({
                cmd: 'feedback', content: {
                    error: true,
                    type: 'eval',
                    message: e.message,
                    func_name: funcName,
                },
            });
            return;
        }
    }

    function covertWHRequest(indicator) {
        let type = 'MAIN';
        switch (indicator.prop) {
            case 'K线附属指标':
                type = 'MAIN';
                break;
            case '副图指标':
                type = 'SUB';
                break;
            case '主图K线形态':
                type = 'MAIN';
                postMessage({
                    cmd: 'feedback', content: {
                        error: true,
                        type: 'define',
                        message: '未实现 主图K线形态',
                        func_name: indicator.name,
                    },
                });
                return null;
        }
        let params = [];
        for (let i = 1; i <= 6; i++) {
            let p = indicator.params[i];
            if (p && p.name)
                params.push([p.name, Number(p.min), Number(p.max), Number(p.defaultValue)]);
        }

        return {
            id: indicator.name, //指标函数名
            cname: indicator.name, //指标中文名称
            type: type, //指标类型, MAIN=主图指标, SUB=副图指标
            params: params,
            src: indicator.draft.code, //文华原代码
        };
    }

    function updateClassDefine(func) {
        let indicatorName = func.name;

        //调用指标函数，提取指标信息
        let params = new Map();
        let inputSerials = new Map();
        let outputSerials = new Map();

        //在global环境中准备全部的系统函数
        let classDefine = {
            name: indicatorName,
            cname: indicatorName,
            type: 'SUB',
            state: 'KLINE',
            yaxis: [{ id: 0 }],
            params: [],
        };
        let C = {};
        C.DEFINE = function (options) {
            if (!(options === undefined)) {
                Object.assign(classDefine, options);
            }
        };

        C.PARAM = function (paramDefaultValue, paramName, options) {
            let paramDefine = params.get(paramName);
            if (paramDefine === undefined) {
                paramDefine = {
                    name: paramName,
                    default: paramDefaultValue,
                };
                if (typeof paramDefaultValue === 'string') {
                    paramDefine.type = 'STRING';
                } else if (typeof paramDefaultValue === 'number') {
                    paramDefine.type = 'NUMBER';
                } else if (paramDefaultValue instanceof COLOR) {
                    paramDefine.type = 'COLOR';
                }

                if (options !== undefined) {
                    paramDefine.memo = options.MEMO;
                    paramDefine.min = options.MIN;
                    paramDefine.max = options.MAX;
                    paramDefine.step = options.STEP;
                }

                params.set(paramName, paramDefine);
            }

            return paramDefaultValue;
        };

        C.SERIAL = () => {
        };

        C.OUT = () => {
        };

        C.OUTS = function (style, serialName, options) {
            if (style === 'KLINE')
                return [null, null, null, null];
            else if (style === 'COLOR_BAR')
                return [null, null];
            else
                return null;
        };

        C.CALC_LEFT = 0;
        C.CALC_RIGHT = 0;

        let id = Keys.next().value;
        postMessage({
            cmd: 'calc_start', content: {
                id: id,
                className: indicatorName,
            },
        });
        try {
            let f = func(C);
            f.next();
        }
        catch (e) {
            postMessage({
                cmd: 'calc_end', content: {
                    id: id,
                    className: indicatorName,
                },
            });
            postMessage({
                cmd: 'feedback', content: {
                    error: true,
                    type: 'define',
                    message: e.message,
                    func_name: indicatorName,
                },
            });
            return;
        }

        postMessage({
            cmd: 'calc_end', content: {
                id: id,
                className: indicatorName,
            },
        });
        postMessage({
            cmd: 'feedback', content: {
                error: false,
                type: 'define',
                message: 'success',
                func_name: indicatorName,
            },
        });

        //指标信息格式整理
        params.forEach((value) => classDefine.params.push(value));

        classDefine.aid = 'register_indicator_class';

        //发送指标类信息到主进程
        WS.sendJson(classDefine);
    }

    return {
        sendIndicatorClassList: init,
        sendIndicatorClass: initOne,
    };
}());
