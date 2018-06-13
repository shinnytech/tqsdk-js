class PublicData{
    constructor(date='latest'){
        this.url = `http://ins.shinnytech.com/publicdata/${date}.json`;
        this.active = null;

        this.cffex_option = null;
        this.combine = null;
        this.future = null;
        this.option = null;

        this.ins_volatility = null;
        this.night = null;
        this.risk_free_interest = null;
        this.times = null;
        this.times_extra = null;
        this.tradingday = null;

        // 'CFFEX.IF1806' => ["CEEEX.IF1806", "CEEEX", "IF", "1806"]
        // 'IF1806'       => ["IF1806", undefined, "IF", "1806"]
        // 'IF'           => ["IF", undefined, "IF", ""]
        this.reg = new RegExp(/([A-Z]*(?=\.))?\.?([A-Za-z]*)([0-9]*)/);
        this.appendData();
    }

    appendData(url = this.url){
        let _this = this;
        fetch(url)
            .then(function(response){
                return response.json();
            })
            .then(function(response){
                _this.active = response.active.split[','];
                _this.cffex_option = response.data.cffex_option;
                _this.combine = response.data.combine;
                _this.future = response.data.future;
                _this.option = response.data.option;
                _this.ins_volatility = response.ins_volatility;
                _this.night = response.night.split[','];
                _this.risk_free_interest = response.risk_free_interest;
                _this.times = {};
                for(let indlist in response.times){
                    for(let ind in indlist.split(',')){
                        _this.times[ind] = response.times[indlist];
                    }
                }
                _this.times_extra = response.times_extra;
                _this.tradingday = response.tradingday;
            });
    }

    getPriceTick(ind){
        let match_arr = ind.match(this.reg);
        if (match_arr && match_arr[2]) {
            return this.future[match_arr[2]].n.ptick;
        }
        return undefined;
    }

    getContractMultiplier(ind){
        let match_arr = ind.match(this.reg);
        if (match_arr && match_arr[2]) {
            return this.future[match_arr[2]].n.contract_multiplier;
        }
        return undefined;
    }

    /**
     * 在一组时间对中，找到对应的开盘、收盘时间
     * @param {*} ind AP
     * @param {*} when 'O' | 'C' 开盘或者收盘
     * @param {*} times 一组时间对
     */
    findTime(ind, when, times){
        let opentime, closetime;

        let max_start = '00:00',
            min_start = '23:59',
            max1_end = '00:00',
            max2_end = '00:00';

        for(let start in times){
            if (start.padStart(5, '0') > max_start) max_start = start;
            if (start.padStart(5, '0') < min_start) min_start = start;
            let end = times[start];
            if (end.padStart(5, '0') > max1_end) max1_end = end;
            else if (end.padStart(5, '0') > max2_end) max2_end = end;
        }
        opentime = max_start > '20:00' ? max_start : min_start;
        closetime = max_start > '20:00' ?  times[max_start] == max1_end ? max2_end : max1_end : max1_end;

        return when === 'O' ? opentime : closetime;
    }

    getOpenCloseTime(ind, when){
        let match_arr = ind.match(this.reg);
        if (match_arr && match_arr[2]) {
            let ind = match_arr[2],
                dt = match_arr[3],
                ind_dt = match_arr[2] + match_arr[3];
            let timesObj = this.times["default"];
            if(this.times_extra[ind_dt]) {
                timesObj = this.times_extra[ind_dt];
            } else if (this.times[ind]){
                timesObj = this.times[ind];
            }
            return this.findTime(ind, when, timesObj);
        }
        return undefined;
    }

    getCloseTime(ind){
        return getOpenCloseTime(ind, 'C');
    }

    getOpenTime(ind){
        return getOpenCloseTime(ind, 'O');
    }

}