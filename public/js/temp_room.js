var socket = io('/tempRooms', {transports: ['websocket'], 
														upgrade: false, 
														query: {room : window.location.pathname.split("/").pop()}}, 
													);
$( document ).ready(function() {
	
	socket.on("set_session", (data)=>{
		sessionStorage.setItem('current_user', data);
	})

	socket.on("user_online", (data)=>{
		deleteAllMemberElements()
		for (const user of data){
			if (sessionStorage.getItem('current_user') == user.user_name){
				createMemberElement(user.name, user.user_name, user.avatar, 'list-group-item-primary')
			}
			else{
				createMemberElement(user.name, user.user_name, user.avatar, '')	
			}
		}
		document.getElementById('online_users').innerHTML = ""
		document.getElementById('online_users').innerHTML = data.length + " Online"
	})


	socket.on("set_host", (data)=>{
		sessionStorage.setItem('host', data)
		console.log(data)
		var user_role_id = data + "-role"
		console.log(user_role_id)
		document.getElementById(user_role_id).innerHTML = document.getElementById(user_role_id).innerHTML + '<span class="mx-auto text-dark"> \
                     									<i class="fa fa-h-square"></i> \
                  											</span>'
	})



	socket.on("new_user", ()=>{
		var message = "A new user has joined the room!";
		showAlert(message, 'success')
	})


	document.getElementById("playAnotherVideo").addEventListener("click", onPlayAnotherVideo);
	document.getElementById("syncVideo").addEventListener("click", onSyncVideo);

	socket.on("receive_message", (data)=>{
		if (data.sender.user_name == sessionStorage.getItem('current_user')){
			createChatElement(data.sender, data.message, "right");
			console.log("In if");
		}
		else{
			createChatElement(data.sender, data.message, "left");
			console.log("in Else");
		}
	})


	socket.on("user_offline", (data)=>{
		deleteMemberElement(data);
		var integer = parseInt(document.getElementById('online_users').innerHTML, 10)
		console.log(integer)
		document.getElementById('online_users').innerHTML = (integer - 1) + " Online"
	})

});

function onPlayAnotherVideo(){
	if (sessionStorage.getItem('current_user') === sessionStorage.getItem('host')){
		var videoId = document.getElementById("video_id").value;
		player.cueVideoById(videoId);
		document.getElementById("video_id").value = ""
		var message = "New YouTube video cued to play!";
		showAlert(message, 'success')
	}
	else{
		var message = "Only host can play new video!";
		showAlert(message, 'warning')
	}
}

function onSyncVideo(){
	if (sessionStorage.getItem('current_user') === sessionStorage.getItem('host')){
		var message = "You are already host!"
		showAlert(message, 'warning')
	}
	else{
		socket.emit("syncMeWithHost");
		var message = "Synching with host";
		showAlert(message, 'primary');
	}
}


function showAlert(message, type){
    $("#alert-top").html(message) 
    var class_var = "alert-" + type;
    $("#alert-top").addClass(class_var);
    $("#alert-top").show().delay(2000).fadeOut(function(){
        $("#alert-top").removeClass(class_var);
        $("#alert-top").html("")
    });  
}

function deleteAllMemberElements(){
	var memberElementContainer = document.getElementById("members-ul");
	memberElementContainer.innerHTML = '';
}


function createMemberElement(member_name, member_username, member_avatar, col){
	var memberElementContainer = document.getElementById("members-ul");
	var memberElement = "<li class='list-group-item " + col + " d-flex' id='" + member_username + "-item'> \
													<img src=/img/avatars/" + 
															member_avatar + ".png alt=''> \
													<div class='w-100'> \
															<div class='user-name small'>" +
																	member_name +
															"</div> \
															<div class='text-muted small' id='" + member_username + "-role'>@" +
																	member_username +
															"</div> \
													</div> \
													<span class='ml-auto text-success float-right' id='" + member_username + "-status'> \
															<i class='fa fa-circle'></i> \
													</span> \
											</li>"

	console.log(memberElement)                   
											
	memberElementContainer.insertAdjacentHTML('beforeend', memberElement);
}


function deleteMemberElement(member_username){
	var elementId = member_username + '-item';
	var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}



function createChatElement(sender, message, pos){
	var chatElementContainer = document.getElementById("chat-ul");
	var chatElement =       "<li class='" + pos + " clearfix'> \
																	<span class='chat-img float-" +
																	pos + 
																	"'> \
															<img src=/img/avatars/" + 
															sender.avatar + ".png alt=''> \
															</span> \
														<div class='chat-body clearfix'> \
															<div class='header'> \
																<strong class='primary-font'>"
																	 + sender.name + 
																"</strong> \
																<span class='primary-font font-italic'>@"
																	+ sender.user_name + 
																	"</span> \
																<small class='float-right text-muted'><i class='fa fa-clock'></i> 12 mins ago</small> \
															</div> \
															<p>" +
																			message +    
															"</p> \
														</div> \
													</li>"

	console.log(chatElement);
													
	chatElementContainer.insertAdjacentHTML('beforeend', chatElement);
}


function onClickSendMessageButton(){
	var my_sender = sessionStorage.getItem("current_user");
	var my_message =  document.getElementById("myMessage").value;
	console.log(my_message)
	var my_room =  window.location.pathname.split("/").pop()
	socket.emit('send_message', {sender: my_sender, message: my_message, room: my_room})
	document.getElementById("myMessage").value = "";
}
