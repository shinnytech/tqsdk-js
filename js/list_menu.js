var ComListMenu = function(div_id){
    this.container = $('#'+div_id);
    this.dom = $('<div></div>').addClass('list-group');
    this.item_doms = {};
}

ComListMenu.prototype.init = function(list){
    for(var i=0; i<list.length; i++){
        this.item_doms[list[i]] = $('<a>'+list[i]+'</a>').addClass('list-group-item').attr('href', '#');
        this.dom.append(this.item_doms[list[i]]);
    }
    this.container.append(this.dom)
};

//
// var list_menu = document.getElementById('list_menu');//$('#');
// var list_items = list_menu.getElementsByTagName('a');
//
// Rx.Observable.fromEvent(list_menu, 'click')
// // .throttleTime(1000)
// // .scan(count => count + 1, 0)
//     .subscribe(function($event){
//         for(var i=0; i<list_items.length; i++){
//             list_items[i].classList.remove('active');
//         }
//         $event.target.classList.add('active');
//
//         var indicator = $event.target.outerText;
//         console.log(indicator)
//         editor.setValue(localStorage.getItem(indicator));
//     });


// <ul class="list-group"  id="list_menu">
//     <a href="#" class="list-group-item active">MA5</a>
//     <a href="#" class="list-group-item">MA10</a>
//     <a href="#" class="list-group-item">MACD</a>
//     <a href="#" class="list-group-item">KDJ</a>
//     </ul>