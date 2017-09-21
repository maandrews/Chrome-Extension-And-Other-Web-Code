// Requests video likes and dislikes from Google, and adds like/dislike bar to each video on the 'watch' pages.

var recent_load = false;
function load_video_page(){
	if(!recent_load){
		recent_load = true;
		console.log("Loading YouTube Video Page Scripts");
		$('.likedislike').remove();

		var videos;
		var placement;
		var uniqueIDIdentifier = 0;

		// Get recommended videos on page
		videos = document.getElementsByClassName("yt-simple-endpoint style-scope ytd-compact-video-renderer");
		placement = document.getElementsByClassName("style-scope ytd-compact-video-renderer");


		for(var i = 0 ; i < videos.length ; i++){
			//console.log(videos[i].search);
			(function(i) { 
				// For each video, obtain its ID.
				var id = videos[i].search.substring(3,14);
				//console.log(id);
				
				// Request a video's likes and dislikes.
				var req_like_dislike = 'https://www.googleapis.com/youtube/v3/videos?part=statistics&id='+id+'&type=video&key=AIzaSyAz_i8bmhxvrqHGfuFs2Ka3knAl7xMTtaA';

				$.getJSON(req_like_dislike, function(data){
					var likes = data.items[0].statistics.likeCount;
					var dislikes = data.items[0].statistics.dislikeCount;
					//console.log(likes +' '+dislikes);
					placeInfo(likes, dislikes);
				});

				function placeInfo(l, d){
					var bar = createBar(l, d, uniqueIDIdentifier++);
					videos[i].children[2].removeAttribute("hidden");
					videos[i].children[2].innerHTML = bar;				
				}

			})(i);
		}	

	}    
	setTimeout(function(){
		recent_load = false;
	},100);
}





