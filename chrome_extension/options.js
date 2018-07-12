
var input = document.getElementById('url');
var btn = document.getElementById('btn');
chrome.storage.sync.get(['ws_url'], function(d){
    input.value = d.ws_url;
});

btn.onclick = function(){
    chrome.storage.sync.set({ws_url: input.value}, function(d){
        alert('设置完毕请刷新页面')
    });
};

