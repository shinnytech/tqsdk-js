'use strict';
function errorHandler(e) {
    console.log(e.name, '-', e);
}

let entry = null;

let updateFilesContent = function(){
    // 把所有文件内容储存在 chrome.stroage.sync
    chrome.runtime.getPackageDirectoryEntry(function (root){
        let dirReader = root.createReader();
        let file_list = {'ind':[], 'custom': []};

        let getFile = function(fileEntry, type, name){
            fileEntry.file(function(file) {
                var reader = new FileReader();
                reader.onloadend = function(e) {
                    file_list[type].push(name);
                    chrome.storage.sync.set({
                        [type]: file_list[type],
                        [name]: this.result
                    }, function() {
                    });
                };
                reader.readAsText(file);
            }, errorHandler);
        }

        var readEntries = function(reader) {
            reader.readEntries (function(results) {
                for(var i = 0; i<results.length; i++){
                    if(results[i].isDirectory){
                        let lastPath = results[i].fullPath.split('/').slice(-1)[0];
                        if(['src', 'libs', 'ind', 'custom'].includes(lastPath)){
                            if(lastPath === 'custom') entry = results[i];
                            readEntries(results[i].createReader());
                        }
                    } else if (results[i].isFile){
                        if( results[i].fullPath.includes('/src/libs/ind') ) {
                            getFile(results[i], 'ind', results[i].name);
                        }else if( results[i].fullPath.includes('/src/libs/custom') ) {
                            getFile(results[i], 'custom', results[i].name);
                        }
                    }
                }
            }, errorHandler);
        };

        readEntries(dirReader); // Start reading dirs.
    });
}

chrome.runtime.onInstalled.addListener(function() {
    updateFilesContent();

    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse){
        if(message.cmd === 'savefile' && message.type === 'custom'){
            entry.getFile(message.name, {}, function (fileEntry) {
                // 目前写文件会报错

                // fileEntry.createWriter(function(writer) {
                //     writer.onerror = errorHandler;
                //     writer.onwriteend = function(){
                //         console.log('onwriteend');
                //     };
                //     writer.write(new Blob([message.content], {type: 'text/javascript'}));
                //
                // }, errorHandler);

            }, errorHandler);
        }
    });
});

const IndicatorUrl = 'chrome-extension://' + location.host + '/src/ta/index.html';

// Called when the user clicks on the browser action.
chrome.browserAction.onClicked.addListener(function(tab) {
    chrome.tabs.getAllInWindow(undefined, function(tabs) {
        for (var i = 0, tab; tab = tabs[i]; i++) {
            if (tab.url && tab.url === IndicatorUrl) {
                chrome.tabs.update(tab.id, {selected: true});
                return;
            }
        }
        updateFilesContent();
        chrome.tabs.create({url: IndicatorUrl});
    });
});
