// Main script that informs other scripts when to execute, as well as return html/css related to the like/dislike bar.

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	setTimeout(function(){
		if(request.data.url != null){
			var page_watch = new RegExp("https://www.youtube.com/watch");
			var page_search = new RegExp("https://www.youtube.com/results");
			chrome.runtime.sendMessage({query: "myURL"}, function(response){
				var tabURL = response.tabUrl;
				if(page_watch.test(tabURL)){
					console.log("On Video Page...");
					setTimeout(function(){
						load_video_page();
					},1500);
				}
				else if(page_search.test(tabURL)){
					console.log("On Search Page...");
					setTimeout(function(){
						load_search_page();
					},1500);
				}
				else if(!page_watch.test(tabURL) && !page_search.test(tabURL)){
					console.log("On Home Page...");
					setTimeout(function(){
						load_home_page();
					},2200);
				}
			});
		}
		else{
			chrome.runtime.sendMessage({query: "myURL"}, function(response){
				var tabURL = response.tabUrl;
				var page_watch = new RegExp("https://www.youtube.com/watch");
				var page_search = new RegExp("https://www.youtube.com/results");
				if(page_watch.test(tabURL)){
					console.log("Video Page Detected...");
					setTimeout(function(){
						load_video_page();
					},1500);
				}
				else if(page_search.test(tabURL)){
					console.log("Search Page Detected...");
					setTimeout(function(){
						load_search_page();
					},1500);
				}
				else if(!page_watch.test(tabURL) && !page_search.test(tabURL)){
					console.log("Home page detected.");
					setTimeout(function(){
						load_home_page();
					},2200);
				}
			});

		}
	},100);
});


function createBar(numLikes, numDislikes, id){
	var res = '';
	numLikes = parseInt(numLikes);
	numDislikes = parseInt(numDislikes);

	if(numLikes && numDislikes){
		if(numLikes == 0 && numDislikes == 0){
			res += '<div class="likedislike">Video not yet rated.</div>';
		}
		else{
			var tot = numLikes+numDislikes;
			var percentLikes = Math.round((numLikes*1.0/tot)*100);
			var percentDislikes = Math.round((numDislikes*1.0/tot)*100);
			console.log(percentLikes+', '+percentDislikes);
			res += '<div class="likedislike"> <style type = "text/css">body{min-width:100%;} #all{width:90px; margin: 0 auto;float:left;} #likes'+id+'{height:5px; width:'+percentLikes+'% ; background:#33A1C9; float:left;}';
			res += '#dislikes'+id+'{height:5px; width:'+percentDislikes+'%; background:#CCCCCC; float:right;} #bar{width:90px;marin: 0 auto;float:left;} </style>';
			res += '<div id="all"><div id="bar"> <div id="likes'+id+'"></div><div id="dislikes'+id+'"></div> </div></div>';
			res += '</div>';
		}
	}
	else{
		res +=  '<div class="likedislike">Video unrated.</div>';
	}
	
	return res;
}


