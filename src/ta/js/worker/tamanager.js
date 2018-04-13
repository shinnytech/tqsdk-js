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
            eval(funcName + ' = ' + code);
            updateClassDefine(self[funcName]);
        } catch (e) {
            console.error(e);
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
            console.error(e)
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
