class EventTarget {
    constructor () {
        this.handlers = {};
    }

    /**
     * 添加事件 Handler
     * @param type
     * @param handler
     */
    addHandler (type, handler) {
        if (this.handlers[type] == undefined) this.handlers[type] = [];
        this.handlers[type].push(handler);
    }

    /**
     * 删除事件 Handler
     * @param string type 时间类型
     * @param handler function
     */
    removeHandler (type, handler) {
        if (this.handlers[type] instanceof Array){
            let handlers = this.handlers[type];
            for (let i=0; i<handlers.length; i++){
                if (handlers[i] == handler){
                    this.handlers[type].splice(i, 1);
                    break;
                }
            }
        }
    }

    /**
     * 出发事件
     * @param event
     */
    fire (event) {
        if (!event.target) event.target = this;
        if (this.handlers[event.type] instanceof Array){
            let handlers = this.handlers[event.type];
            for (let i=0; i<handlers.length; i++){
                handlers[i](event);
            }
        }
    }
}
