// /**
//  * 为一个标准array创建一个延迟计算array.
//  * @param target_array
//  * @param calc_func
//  * @returns {Proxy}
//  */
// function createLazyArray(target_array, calc_func) {
//     let handler = {
//         get(target, propKey, receiver) {
//             let index = Number(propKey);
//             if (index < 0) {
//                 propKey = String(target.length + index);
//             }
//             return Reflect.get(target, propKey, receiver);
//         }
//     };
//     return new Proxy(target, handler);
// }
//
// a = [3, 5, 6, 8, 10];
// a["100000000"] = 10;
// console.log(a.slice(-4));
// console.log(a.length);


//
// v = function(a){return a*2;}
// v.last_id = 5;
// v.high = function(b) {return b*10;}
//
// console.log(v(3));
// console.log(v.last_id);
// console.log(v.high(100));
//
// s = {a:1, b:2};
// p = new Proxy(s, {});
// console.log(s.a);
//
// let a = [1, 2, 3, 4, 5];
// a.field = "abc";
// var handler = {
//     get: function(target, property, receiver) {
//         return target[property];
//     },
// };
// console.log(a.slice(2, 5));
// console.log(a.field);
// let n = new Proxy(a, handler);
// n.field = "abc";
// console.log(n.slice(2, 5));
// console.log(n.field);
// console.log([ 3434, 3435 ] == [ 3434, 3435 ]);


let 中文变量 = "abc";
console.log(中文变量);

let 中文对象 = {
    坐标: 1,
    参数: 2,
};
console.log(中文对象);

function 中文函数(中文参数){
    return 中文参数 * 5;
}
console.log(中文函数(3));

// function f(a, b=a){
//     return [a+b];
// }
// console.log(f(3));
//
// /**
//  * 计算
//  * @param a1
//  * @param a2
//  * @param b1
//  * @param b2
//  */
// function intesect_range(a1, a2, b1, b2){
//
// }