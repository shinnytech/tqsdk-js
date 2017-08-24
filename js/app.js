var main_app = {
    editing_indicator: ''
}
// var get_meta_data = function (instrument, duration, p, n) {
//     // todo: 获取原始数据
//     return DM.datas.klines[instrument][duration]["data"][p]
//         ? DM.datas.klines[instrument][duration]["data"][p][n] : 0;
// };
// var curried_meta_data = _.curry(get_meta_data);
//
// var get_param = function (param_name) {
//     // todo: 获取参数
//     return 10;
// };
// var curried_param = _.curry(get_param);
//
// var get_sum = function (func, N) {
//     return _.sum(_.map(func, _.range(0, N)))
// };
// var curried_sum = _.curry(get_sum);
//
// var calc_out = function (output_serial_name, func, param, p) {
//     // check param
//     console.log(arguments);
//     // calculate
//
// };
//
// // 用户可用基础函数
// window.TQ.base = {
//     high: curried_meta_data(_, 'high'),
//     low: curried_meta_data(_, 'low'),
//     open: curried_meta_data(_, 'open'),
//     close: curried_meta_data(_, 'close'),
//
//     sum: curried_sum(_, _),
//     param: curried_param(_),
//     out: calc_out
// }

// MA sum( N*close) /N

// TQ.sum(TQ.close(), 26)
// TQ.sum(TQ.high() - TQ.open(), 26)


// var get_meta_data = function (p, n) {
//     return DM.datas.klines['IF1709'][3600000000000]["data"][p] ? DM.datas.klines['IF1709'][3600000000000]["data"][p][n] : 0;
// };
//
// var curried = _.curry(get_meta_data);
//
// var high = curried(_, 'high');
// var low = curried(_, 'low');
// var open = curried(_, 'open');
// var close = curried(_, 'close');
//
// function sum(func, N, P) {
//     var v = 0;
//     for (var i = 0; i < N; i++) {
//         if (P > i) {
//             v = v + func(P - i)
//         }
//     }
//     return v;
// }
//
// function br(n, P) {
//     return sum(function (P) {
//             return _.max(_.concat([high(P) - close(P - 1)], 0));
//         }, n, P)
//         / sum(function (P) {
//             return _.max(_.concat([close(P - 1) - low(P - 1)], 0));
//         }, n, P);
// }
//
// var main_calc = _.curry(br)(26);
// var start_id = 300;
// var last_id = 310;
// var result = _.map(function (p) {
//     return main_calc(p);
// })(_.range(start_id)(last_id));
//
// console.log(result)