
/**
 * 返回指定变量的数据类型
 * @param  {Any} data
 * @return {String} Array Object Generator Function String Number Null Undefined Boolean
 */
const type = (d) => Object.prototype.toString.call(d).slice(8, -1);

/*
 * =========== Notification ===================
 * Notify
 *    "success",
 *    "err", "error",
 *    "warn", "warning",
 *    "info", "information",
 *    "noty", "notification"
 */
const Notify = (function () {
    let debug = false;

    let defaults = {
        layout: 'topRight',
        theme: 'relax',// defaultTheme, relax, bootstrapTheme, metroui
        type: 'information',
        force: true,
        timeout: 2000,
        maxVisible: 50,
        closeWith: ['click', 'button'],
    };

    function getNotyFun(type) {
        if (!debug) {
            return function (text) {
                return noty(Object.assign(defaults, { text, type }));
            };
        } else {
            return function (text) {
                return console.log('%c%s', 'color: #7C37D4', type + ' : ' + text);
            };
        }
    }

    let notys = {};
    notys.success = getNotyFun('success');
    notys.error = notys.err = getNotyFun('error');
    notys.warning = notys.warn = getNotyFun('warning');
    notys.information = notys.info = getNotyFun('information');
    notys.notification = notys.noty = getNotyFun('notification');
    return notys;
}());

/**
 * 生成指定长度的随机字符串
 * 默认长度为 8
 */
const RandomStr = function (len = 8) {
    var charts = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var s = '';
    for (var i = 0; i < len; i++) s += charts[Math.random() * 0x3e | 0];
    return s;
}

/**
 * 生成序列生成器
 * 默认从 0 开始
 */
function* GenerateSequence(start = 0) {
    while (true) {
        yield start.toString(36);
        start++;
    }
}

/**
 * 解析字符串，读取交易所和交易代码
 */
function ParseSymbol(str) {
    var match_arr = str.match(/([^\.]+)\.(.*)/);
    return {
        exchange_id: match_arr ? match_arr[1] : '',// 交易所代码
        instrument_id: match_arr ? match_arr[2] : ''// 合约代码
    }
}




