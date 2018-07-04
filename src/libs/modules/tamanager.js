class TaManager {
    constructor(tq){
        this.TQ = tq;
        this.class_dict = {};
        this.instance_dict = {};
    }

    register_indicator_class(ind_func){
        this.class_dict[ind_func.name] = ind_func;
        return new IndicatorDefineContext(ind_func);
    };

    unregister_indicator_class(ind_func_name) {
        delete this.class_dict[ind_func_name];
    };

    new_indicator_instance(ind_func, symbol, dur_nano, ds, params = {}, instance_id) {
        let ind_instance = new IndicatorRunContext(ind_func, instance_id, symbol, dur_nano, params, ds, this.TQ);
        this.instance_dict[instance_id] = ind_instance;
        return ind_instance;
    };

    delete_indicator_instance(ind_instance) {
        delete this.instance_dict[ind_instance.instance_id];
    };
}

TaManager.Keys = GenerateSequence();