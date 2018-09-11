class TaManager {
    constructor(tq){
        this.TQ = tq;
        this.class_dict = {};
        this.instance_dict = {};
        this.running_class = null;
        this.running_instance = null;
    }

    register_indicator_class(ind_func){
        this.class_dict[ind_func.name] = ind_func;
        this.running_class = ind_func;
        let ctx = new IndicatorDefineContext(ind_func);
        this.running_class = null;
        return ctx;
    };

    unregister_indicator_class(ind_func_name) {
        delete this.class_dict[ind_func_name];
    };

    new_indicator_instance(ind_func, symbol, dur_nano, ds, params = {}, instance_id) {
        let ind_instance = new IndicatorRunContext(ind_func, instance_id, symbol, dur_nano, params, ds, this.TQ);
        this.instance_dict[instance_id] = ind_instance;
        if(this.running_class) return null;
        if(this.running_instance) this.running_instance.children.push(instance_id);
        return ind_instance;
    };

    delete_indicator_instance(ind_instance) {
        let instance_id = ind_instance.instance_id ? ind_instance.instance_id : ind_instance;
        // 先删除子指标
        let children = this.instance_dict[instance_id].children;
        for(let i=0; i<children.length; i++){
            delete this.instance_dict[children[i]];
        }
        delete this.instance_dict[instance_id];
    };
}

TaManager.Keys = GenerateSequence();