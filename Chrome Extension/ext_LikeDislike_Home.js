// Requests video likes and dislikes from Google, and adds like/dislike bar to each video on the YouTube home page.

var recent_load = false;
function load_home_page(){
	if(!recent_load){
		recent_load = true;
		console.log("Loading YouTube Home Scripts");
		$('.likedislike').remove();

		var videos;
		var uniqueClassName
		var uniqueIDIdentifier = 0;

		// Get recommended videos on page
		videos = document.getElementsByClassName("yt-simple-endpoint style-scope ytd-grid-video-renderer");
		uniqueClassName = document.getElementsByClassName("style-scope ytd-two-column-browse-results-renderer");
		
		/*var target = uniqueClassName[0].children[2];
		var observer = new MutationObserver(function(mutations) {
		    mutations.forEach(function(mutation) {
		        console.log("hi");
		    });
		});
		var config = {childList: true};
		observer.observe(target, config);*/

		var id = [];
		var idIndex = 0;

		for(var i = 0 ; i < videos.length ; i++){

			(function(i) { 
				// For each video, obtain its ID.
				id.push(videos[i].search.substring(3,14));
				//console.log(id);
			})(i);

		}
		setTimeout(function(){
			for(var j = 0 ; j < uniqueClassName[0].children[2].children.length ; j++){
				(function(j) { 

					if(uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[0].id == "grid-container"){

						var req_like_dislike = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id='+id[idIndex++]+'&type=video&key=AIzaSyAz_i8bmhxvrqHGfuFs2Ka3knAl7xMTtaA';

						$.getJSON(req_like_dislike, function(data){
							var likes = data.items[0].statistics.likeCount;
							var dislikes = data.items[0].statistics.dislikeCount;
							//console.log(likes +' '+dislikes);
							placeInfo_Channel_1Vid(likes, dislikes);
						});
						function placeInfo_Channel_1Vid(l, d){
							var bar = createBar(l, d, uniqueIDIdentifier++);
							uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children[0].removeAttribute("hidden");
							uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children[0].innerHTML = bar;
						}

					}
					else if(uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[1].id == "scroll-container"){
						if(uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[1].children[0].children[0].children[0].className != "style-scope ytd-grid-radio-renderer"){
							for(var k = 0, len = uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[1].children[0].children.length ; k < len; k++){
								(function(k) { 

									var req_like_dislike = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id='+id[idIndex++]+'&type=video&key=AIzaSyAz_i8bmhxvrqHGfuFs2Ka3knAl7xMTtaA';

									$.getJSON(req_like_dislike, function(data){
										var likes = data.items[0].statistics.likeCount;
										var dislikes = data.items[0].statistics.dislikeCount;
										//console.log(likes +' '+dislikes);
										placeInfo_Channel_Mult_Vids(likes, dislikes);
									});
									function placeInfo_Channel_Mult_Vids(l, d){
										var bar = createBar(l, d, uniqueIDIdentifier++);
										uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[1].children[0].children[k].children[0].children[1].children[0].children[0].children[0].removeAttribute("hidden");
										uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[1].children[0].children[k].children[0].children[1].children[0].children[0].children[0].innerHTML = bar;									
									}
								})(k);
							}
						}
					}
					else{
						for(var k = 0, len = uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[2].children.length ; k < len ; k++){
							(function(k) {

								var req_like_dislike = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id='+id[idIndex++]+'&type=video&key=AIzaSyAz_i8bmhxvrqHGfuFs2Ka3knAl7xMTtaA';

								$.getJSON(req_like_dislike, function(data){
									var likes = data.items[0].statistics.likeCount;
									var dislikes = data.items[0].statistics.dislikeCount;
									//console.log(likes +' '+dislikes);
									placeInfo_Single_Vid(likes, dislikes);
								});
								function placeInfo_Single_Vid(l, d){
									var bar = createBar(l, d, uniqueIDIdentifier++);
									uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[2].children[k].children[0].children[1].children[0].children[0].children[0].removeAttribute("hidden");
									uniqueClassName[0].children[2].children[j].children[2].children[0].children[0].children[1].children[0].children[2].children[k].children[0].children[1].children[0].children[0].children[0].innerHTML = bar;
								}
							})(k);
						}
					}

				})(j);
			}
			
		},200);		

	}
	setTimeout(function(){
		recent_load = false;
	},100);
}


