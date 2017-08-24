
function indicators_init(){
    var editor = ace.edit("editor");
    editor.getSession().setMode("ace/mode/javascript");
    editor.setValue(localStorage.getItem('MA'));
    editor.$blockScrolling = Infinity;
    return editor;
}

// var con = document.querySelector("#con");
// console.olog = console.log;
// console.log = function() {
//     //do what u want do;
//
//     result.setValue(result.getValue() + '\n' + [].join.call(arguments, '')) ;
//     // con.innerHTML += "<p>"+ [].join.call(arguments, '') + "</p>";
//     this.olog.apply(this, arguments);
// }