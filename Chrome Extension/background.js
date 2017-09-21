/* 
 * Background script used to listen for events.
 * Listen for when a tab changes URL or active tab switches, and also respond to other scripts with the current active tab's URL
 */

// If tab URL changes, send info to content scripts.
var used = false;
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		if(changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined){
			if(!used){
				used = true;
				chrome.tabs.sendMessage(tabId, {data: tab}, function(response) {
					console.log(response);
				});
				setTimeout(function(){
					used = false;
				},250);
			}

		}
});

// If active tab changes, send info to content scripts.
var used2 = false;
chrome.tabs.onActivated.addListener(function(activeInfo){
		if(!used2){
			used2 = true;
			chrome.tabs.sendMessage(activeInfo.tabId, {data: activeInfo}, function(response) {
				console.log(response);
			});
			setTimeout(function(){
				used2 = false;
			},1000);
		}
});

// Answer content scripts' requests for active tab URL information.
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.query === "myURL"){
         console.log("Sending tab URL information");
         sendResponse({tabUrl:sender.tab.url});
    }
});





