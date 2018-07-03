class Strategy{
    constructor(div){
        this.params = {};
        this.init();
        this.initParams();
    }
    defineParam(id, type, defalut, name){
        return this.params[id] = {type, defalut, name};
    }
    initParams(){

    }
}
class st extends Strategy{
    init(){
        this.symbol = this.defineParam('symbol', 'string', 'SHFE.rb1810', '合约代码');
        this.dur = this.defineParam('dur', 'number', 90, '合约周期');
        this.quote = TQ.GET_QUOTE(symbol);
        this.ma = new TQ.NEW_INDICATOR_INSTANCE(ma, this.symbol, this.dur);
        this.m1 = this.ma.outs.ma5;
        this.m2 = this.ma.outs.ma20;
    }
    onTick(){
        if (this.m1(-1) > this.m2(-1) && this.m1(-2) <= this.m2(-2)){
            return {
                dir: "BUY",
                vol: 1
            }
        }
        if (this.m1[i] < this.m2[i] && this.m1[i-1] >= this.m2[i-1]){
            return {
                dir: "SELL",
                vol: 1
            }
        }
    }

}



s.on('insert_order', function(order){
    let {d, v} = dir();

});

s.on('before_start', function(){
    console.info('event before_start')
});

s.on('tick', function(){
    console.info('event tick')
});

s.on('bar', function(){
    console.info('event tick')
});

s.on('account', function(){
    // let risk = 。。。。。
    console.info('event account')
});

s.on('trades', function(){
    console.info('event trades')
});

s.on('positions', function(){
    console.info('event positions')
});

s.on('error', function(){
    console.error('event error')
});

s.on('pause', function(){
    console.info('event pause')
});

s.on('before_stop', function(){
    console.info('event before_stop');
    // 清仓
});

s.on('stop', function(){
    console.info('event stop')
});
