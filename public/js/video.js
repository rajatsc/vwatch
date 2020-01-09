var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;
function onYouTubeIframeAPIReady() {
player = new YT.Player('video', {
	height: "100%",
	width: "100%",
	playerVars: { 'autoplay': 1, 
				'controls': 1 },
	
	events: {
		'onReady': onPlayerReady,
		'onStateChange': onPlayerStateChange
	}
});
}


function getHostData(){
	var videoData = {
		status: player.getPlayerState(),
		currTime: player.getCurrentTime(),
		videoId: player.getVideoData()['video_id']
	};

	return videoData;
}



socket.on("getHostData", (data)=>{
	//console.log(data)
	if (sessionStorage.getItem('current_user') === sessionStorage.getItem('host')){
		console.log("getting data")
		socket.emit("receiveHostData", {caller_socketId: data.caller_socketId, hostData: getHostData()})
	}
})


/*

-1 unstarted

0 ended event.data == YT.PlayerState.ENDED

1 playing event.data == YT.PlayerState.PLAYING

2 paused event.data == YT.PlayerState.PAUSED

3 buffering 

5 video cued

*/

function onPlayerStateChange(event){

	//console.log(event.data)

	if (sessionStorage.getItem('current_user') === sessionStorage.getItem('host')){
		console.log("Host status has changed!")
		if (event.data === 0){
			socket.emit('play_next', {})
		}
		else if (event.data === 3 || event.data === -1){
		}
		else {
			console.log(event.data + " sync others with host!")
			socket.emit('syncOthersWithHost', getHostData())
		}
	}

	else{
		console.log("Others status has changed")
		if (event.data === 1 || event.data === 2 || event.data === 5){
			console.log(event.data + " sync me with host!")
			socket.emit("syncMeWithHost")
		}
	}

}

/*
setInterval(function(){
if (getCookie('current_user') == localStorage.getItem('host')){
    socket.emit('updateHostData', getHostData()); 
}
}, 100);
*/

socket.on("sync", (data)=>{
	console.log("+++++++++++++++++++++++++++++++++++++++++++++")
	console.log("sync order received")
	var hostStatus = data.status;
	var hostTime = data.currTime;
	var hostVideoId = data.videoId;

	var clientStatus = player.getPlayerState()
	var clientTime = player.getCurrentTime();
	var clientVideoId = player.getVideoData()['video_id']

	if (hostStatus === 1){
		console.log("Host player status " + hostStatus)
		console.log(hostTime)
		console.log(clientTime)

		if (hostTime < 0.2){
			player.playVideo()
		}

		if (Math.abs(hostTime - clientTime) > 0.2){
			console.log(Math.abs(hostTime - clientTime))
			console.log("seeking hostTime")
			player.seekTo(hostTime)
			console.log("Printing state right after seek")
			console.log(player.getPlayerState())
		}

		if (clientStatus === 2){
			player.playVideo()
		}
	} 
	
	else if (hostStatus === 2){
		console.log("Host player status " + hostStatus)
		console.log(hostTime)
		console.log(clientTime)
		if (clientStatus === 1){
			player.pauseVideo()
		}
	}
	
	else if (hostStatus === 5){
		console.log("Host player status " + hostStatus)
		if (hostVideoId !== clientVideoId){
			player.cueVideoById(hostVideoId)
		}
	}
})


socket.on('playingNext', (video_id)=>{
	player.cueVideoById(video_id);
})


//Play and Pause button
document.getElementById("playAndPause").addEventListener("click", togglePlayAndPause);

function togglePlayAndPause() {
	const icon = this.querySelector('i');

	if (player.getPlayerState() == YT.PlayerState.PLAYING) {
        player.pauseVideo();
        icon.classList.remove('fa-pause');
        icon.classList.add('fa-play');
    }
	else{
		player.playVideo();
		icon.classList.remove('fa-play');
    	icon.classList.add('fa-pause');
	}
}

//Mute and Unmute button
document.getElementById("muteAndUnmute").addEventListener("click", toggleMuteAndUnmute);

function toggleMuteAndUnmute(){
	const icon = this.querySelector('i');

	if(player.isMuted()){
        player.unMute();
        icon.classList.remove('fa-volume-off');
        icon.classList.add('fa-volume-up');
    }
	else{
        player.mute();
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-off');
    }
}


document.getElementById("step_forward").addEventListener("click", onStepForward);
document.getElementById("step_backward").addEventListener("click", onStepBackward);


function onStepBackward(){
	console.log("clicked step backward")
	socket.emit("play_previous")
}


function onStepForward(){
	console.log("clicked step forward")
	socket.emit("play_next");
}


