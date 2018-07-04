class IndicatorContext {
    constructor(ind_func) {
        this.instance = ind_func(this);
        this.ind_class_name = ind_func.name;
        this.OUTS_TYPE = new Proxy({}, {
            get: function (target, property, receiver) {
                switch (property){
                    case 'COLORBAR':
                    case 'COLORDOT':
                        return 2;
                    case 'KLINE':
                        return 4;
                    default:
                        return 1;
                }
            }
        });
            // 'INVISIBLE': 1, // 不绘制序列
            // 'LINE': 1, // 序列以折线绘制
            // 'DOT': 1, // 序列以点绘制
            // 'BAR': 1, // 序列以柱状图绘制, 使用单一颜色
            // 'PCBAR': 1, //	序列以柱状图绘制, 自动使用对应K线的颜色配置
            // 'RGBAR': 1, // 序列以柱状图绘制, 当序列值>=0时使用红色, <0时使用绿色
            // 'COLORBAR': 2, // 序列以柱状图绘制, 并为每个柱子单独指定颜色. C.OUTS的返回类型为 [array, array], 分别为值序列和颜色序列
            // 'COLORDOT': 2,
            // 'KLINE': 4 //序列以K线图绘制, C.OUTS的返回类型为 [array, array, array, array], 分别为开高低收4个序列
            //
    }
    init(){
        this.instance.next();
    }
    DEFINE() {};
    PARAM() {};
    OUTS() {};
    ORDER() {};
    TRADE_AT_CLOSE(){};
    TRADE_OC_CYCLE(){};
}

class IndicatorDefineContext extends IndicatorContext{
    constructor(ind_func) {
        super(ind_func);
        this.define = {
            aid: 'register_indicator_class',
            name: this.ind_class_name,
            cname: this.ind_class_name,
            type: 'SUB',
            state: 'KLINE',
            yaxis: [{ id: 0 }],
            params: [],
        };
        this.params = new Map();
    }

    DEFINE(options) {
        if (options) {
            Object.assign(this.define, options);
        }
    };

    PARAM(paramDefaultValue, paramName, options) {
        let paramDefine = this.params.get(paramName);
        if (!paramDefine) {
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
    get_define() {
        super.init();
        this.params.forEach((value) => this.define.params.push(value));
        return this.define;
    }
}