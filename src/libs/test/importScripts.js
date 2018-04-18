const fs = require('fs');
const vm = require('vm');

module.exports = function(...files){
    for(var uri of files){
        if(typeof uri == 'string'){
            let str = fs.readFileSync(uri, 'utf-8');
            vm.runInThisContext(str)
        }
    }
}
