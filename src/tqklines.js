
// function getKSequence(){

//     var seq

//     return new KSequence();
// }

// var ins_id = 'SHFE.cu1705';
// var dur_nano = 13248000000000;
// var width = 1000;

// var KSequence = getKSequence({ ins_id, dur_nano, width });

// KSequence[-1]

// KSequence.datetime //UnixNano 北京时间，如果是日线，则是交易日的 UnixNano
// KSequence.open //开
// KSequence.high //高
// KSequence.low //低
// KSequence.close //收
// KSequence.volume //成交量
// KSequence.open_oi //起始持仓量
// KSequence.close_oi //结束持仓量

/**
 {
    "aid": "update_indicator_instance",         //必填, 创建/修改 技术指标实例
    "ta_class_name": "MACD",                    //必填, 指标名称，与register_indicator中的name一致
    "instance_id": "abc324238",                 //必填, 指标实例ID，每个指标实例都有唯一的实例ID号
    "epoch": 1234,                              //必填, 实例版本号，同一指标实例每次变更都会+1
    "ins_id": "cu1701",                         //必填, 技术指标所在图表当前合约 //（图表上合约可以为1-N个，其中第一个为主合约）
    "dur_nano": 13248000000000,                 //必填, 技术指标所在图表当前周期，以纳秒数表示, -1为无效标志
    "view_left": 1000,                          //必填, 技术指标所在图表显示区域左端序号, -1为无效标志
    "view_right": 3000,                         //必填, 技术指标所在图表显示区域右端序号, -1为无效标志
    params = {                                 //必填, 指标参数
            "N": {"value": 30},
            "S": {"value": "abcd"},
        }
}
*/