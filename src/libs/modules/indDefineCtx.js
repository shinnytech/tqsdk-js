class IndicatorDefineContext {
    constructor(ind_func) {
        this.instance = ind_func(this);
        let indicatorName = ind_func.name;
        this.define = {
            aid: 'register_indicator_class',
            name: indicatorName,
            cname: indicatorName,
            type: 'SUB',
            state: 'KLINE',
            yaxis: [{ id: 0 }],
            params: [],
        };
        this.params = new Map();
    }

    DEFINE(options) {
        if (!(options === undefined)) {
            Object.assign(this.define, options);
        }
    };

    PARAM(paramDefaultValue, paramName, options) {
        let paramDefine = this.params.get(paramName);
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
                Object.assign(paramDefine, options);
            }
            this.params.set(paramName, paramDefine);
        }
        return paramDefaultValue;
    };
    OUTS() {
    };
    ORDER() {
    };
    TRADE_AT_CLOSE(){
    };
    TRADE_OC_CYCLE(){
    };
    get_define() {
        this.instance.next();
        this.params.forEach((value) => this.define.params.push(value));
        return this.define;
    }
}