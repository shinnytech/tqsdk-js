class Strategy extends EventTarget{
    constructor(){
        super();
        this.paused = false;
        this.types = {
            'account': 0, // types
            'tick': 1,  // extendable_types
            'quote': 1,
            'trade': 1,
            'kline': 1,
            'position': 1
            // 'quote': ['SHFE.rb1810'],  // extendable_types
        }
    }

    on(){
        let func = arguments[arguments.length - 1];
        if(typeof func === "function" && arguments.length >= 2){
            if(arguments.length === 2){
                this.addHandler(arguments[0], func);
            } else {

            }
        }
    }

    start(){
        if(TQ && TQ.account_id){
            this.fire({
                type: 'start'
            });
            TQ.ws.addHandler('onmessage', (function(message){
                let on_obj = {
                    order: false,
                    tick: false,
                    trade: false,
                    position: false,
                    account: false,
                    quote: false
                }
                if(message.data.aid === 'rtn_data'){
                    for (let i = 0; i < message.data.length; i++) {
                        let d = message.data[i];
                        let orders = getobj(d, 'trade', TQ.dm.account_id, 'orders');
                    }
                }
                switch(message.data.aid){
                    case "rtn_data":
                        for (let i = 0; i < message.data.length; i++) {
                            let d = message.data[i];
                            let orders = getobj(d, 'trade', this.dm.account_id, 'orders');
                            for (let order_id in orders){
                                let order = orders[order_id];
                                let orign_order = this.dm.get('trade', this.dm.account_id, 'orders', order_id);
                                let volume_change = order.status == "ALIVE"?order.volume_left:0;
                                if (orign_order && orign_order.status == "ALIVE"){
                                    volume_change = volume_change - orign_order.volume_left;
                                }
                                this.process_unit_order(order, volume_change);
                            }
                            let trades = getobj(d, 'trade', this.dm.account_id, 'trades');
                            for (let trade_id in trades){
                                let trade = trades[trade_id];
                                this.process_unit_trade(trade);
                            }
                        }
                        break;
                    default:
                        return;
                }
            }).bind(this));
        } else {
            console.log('未登录')
        }
    }

    pause(){
        this.fire({
            type: 'pause'
        });
    }

    stop(){
        this.fire({
            type: 'stop'
        });
    }
}