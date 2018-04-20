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
            return function (content) {
                var text = null;
                if (typeof content == 'string'){
                    text = content;
                } else {
                    /**
                     * content = {
                     *      error: true, // true | false
                     *      type: 'define', // define | run
                     *      message: 'xxxxxxxxxxxx',
                     *      func_name: 'ma'
                     * }
                     */
                    text = `函数 ${content.func_name} 运行`;
                    text += type == 'error' ? `失败，<br/>错误内容: ${content.message}` : '成功！';
                }
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
