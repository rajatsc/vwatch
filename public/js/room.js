var socket = io('/rooms', {transports: ['websocket'], 
														upgrade: false, 
														query: {room : window.location.pathname.split("/").pop()}}, 
													);

var room_url = window.location.pathname.split("/").pop();
if (!socket){
		window.location.href = '../auth/sign_in'
}

var host = false;
$(document).ready(function(){

	$('#addVideoButton').attr('disabled',true);
    $('#addVideoInput').keyup(function(){
        if($(this).val().length !=0){
            //console.log($(this).val().length)
            $('#addVideoButton').attr('disabled', false);
            }            
        else{
            $('#addVideoButton').attr('disabled',true);
        }
    })

	/*
	async function getUserAsync() 
	{
  		var response_data = await fetch(`http://127.0.0.1:8080/users/current_user_data`, {mode: 'no-cors'});
  		console.log(response_data.json())
	}
	*/


	socket.on("set_sessionStorage", (data)=>{
		sessionStorage.setItem('current_user', data)
	})


	//activate addMemberButton oly when text area is non empty

	$('#addMemberButton').attr('disabled',true);
	$('#addMemberInput').keyup(function(){
			if($(this).val().length !=0){
					//console.log($(this).val().length)
					$('#addMemberButton').attr('disabled', false);
					}            
			else{
					$('#addMemberButton').attr('disabled',true);
			}
	})





  socket.emit("get_host_data", {})

	socket.on("user_online", (data)=>{
		//console.log("Listening to user online!!!")
		//console.log(data)
		for (const user of data){
			var user_status_id = user + "-status"
  			//console.log(user_status_id);
			//console.log(document.getElementById(user_status_id).classList)
			document.getElementById(user_status_id).classList.remove('text-muted');
			//console.log(document.getElementById(user_status_id).classList)
			document.getElementById(user_status_id).className += " text-success";
			//console.log(document.getElementById(user_status_id).classList)
		}
		var total_online_users = data.length
		document.getElementById("online_users").textContent=total_online_users + " Online";
		
	})

	socket.on("find_me", (data)=>{
		//console.log("Inside find me")
		var element_id = data + "-item"
		document.getElementById(element_id).className += " list-group-item-primary";
	})

	socket.on("set_host", (data)=>{
		//console.log("setting host!!!");
		//console.log(data)
		if (sessionStorage.getItem('host') !== sessionStorage.getItem('current_user')){
			sessionStorage.setItem('host', data);
			//console.log('Host set')
			var user_role_id = data + "-role"
			document.getElementById(user_role_id).innerHTML = document.getElementById(user_role_id).innerHTML + '<span class="mx-auto text-dark"> \
                     									<i class="fa fa-h-square"></i> \
                  											</span>'
			//console.log(document.getElementById(user_role_id).innerHTML);
		}
		
	})


	socket.on("unset_host", (data)=>{
		//console.log("unsetting host!!!");
		//console.log(data)
		if (sessionStorage.getItem('host') === data){
			//console.log("Inside if loop of unsetting host")
			sessionStorage.setItem('host', null);
			var user_role_id = data + "-role";
			document.getElementById(user_role_id).innerHTML = "";
			document.getElementById(user_role_id).innerHTML = "@" + data
		}
	})

	
	socket.on("user_offline", (data)=>{
		//console.log(data)
		var user_status_id = data + "-status"
		if (document.getElementById(user_status_id)){
			//console.log(document.getElementById(user_status_id).classList)
			document.getElementById(user_status_id).classList.remove('text-success');
			//console.log(document.getElementById(user_status_id).classList)
			document.getElementById(user_status_id).className += " text-muted";
			//console.log(document.getElementById(user_status_id).classList)
		//document.getElementById("online_users").textContent=data.total_online_users + " Online";
		}
	})

	
	/****  Add member response *****/
	socket.on('add_member_response', (data)=>{
		var response = data.response
		var member= data.member
		if (response == 0){
			//console.log('value is 0')
            var message = "No user with username <strong>" + member + "</strong> found in database!";
            showAlert(message, "danger")
		} else if (response == 1){
			createMemberElement(member.name, member.userName, member.avatar)
			var message = "User with username <strong>" + member.userName + "</strong> succesfully added to room!";
            showAlert(message, 'success')
		}
		else{
            var message = "User with username <strong>" + member.userName + "</strong> already in room!"
			showAlert(message, 'primary')
		}
	})

	/****** Receive message socket ******/
	socket.on('receive_message', (data)=>{
		if (data.sender.user_name === sessionStorage.getItem('current_user')){
			createChatElement(data.sender, data.message, "right");
		}
		else{
			createChatElement(data.sender, data.message, "left");
		}

	})


	socket.on('cannotLeaveRoom', ()=>{
        var message = "You are the Admin and cannot leave room. Go back to your profile and delete Room."
		showAlert(message, 'danger')
	})



	socket.on('leavingRoom', (data)=>{
		if (sessionStorage.getItem('current_user') === data){
			window.location.href = '../users/current';
		}
		else{
			removeMemberElement(data);
			var integer = parseInt(document.getElementById('online_users').innerHTML, 10)
			document.getElementById('online_users').innerHTML = (integer - 1) + " Online"
			var message = "<strong>" + data + "</strong> has left the room!"
            showAlert(message, 'danger')    
		}

	})




	//==========================================//
	//************* mlti-item carousel *********//
	//=========================================//

	var itemsMainDiv = ('.MultiCarousel');
    var itemsDiv = ('.MultiCarousel-inner');
    var itemWidth = "";

    $('.leftLst, .rightLst').click(function () {
        var condition = $(this).hasClass("leftLst");
        if (condition)
            click(0, this);
        else
            click(1, this)
    });

    ResCarouselSize();




    $(window).resize(function () {
        ResCarouselSize();
    });

    //this function define the size of the items
    function ResCarouselSize() {
        var incno = 0;
        var dataItems = ("data-items");
        var itemClass = ('.item');
        var id = 0;
        var btnParentSb = '';
        var itemsSplit = '';
        var sampwidth = $(itemsMainDiv).width();
        var bodyWidth = $('body').width();
        $(itemsDiv).each(function () {
            id = id + 1;
            var itemNumbers = $(this).find(itemClass).length;
            btnParentSb = $(this).parent().attr(dataItems);
            itemsSplit = btnParentSb.split(',');
            $(this).parent().attr("id", "MultiCarousel" + id);


            if (bodyWidth >= 1200) {
                incno = itemsSplit[3];
                itemWidth = sampwidth / incno;
            }
            else if (bodyWidth >= 992) {
                incno = itemsSplit[2];
                itemWidth = sampwidth / incno;
            }
            else if (bodyWidth >= 768) {
                incno = itemsSplit[1];
                itemWidth = sampwidth / incno;
            }
            else {
                incno = itemsSplit[0];
                itemWidth = sampwidth / incno;
            }
            $(this).css({ 'transform': 'translateX(0px)', 'width': itemWidth * itemNumbers });
            $(this).find(itemClass).each(function () {
                $(this).outerWidth(itemWidth);
            });

            $(".leftLst").addClass("over");
            $(".rightLst").removeClass("over");

        });
    }


    //this function used to move the items
    function ResCarousel(e, el, s) {
        var leftBtn = ('.leftLst');
        var rightBtn = ('.rightLst');
        var translateXval = '';
        var divStyle = $(el + ' ' + itemsDiv).css('transform');
        var values = divStyle.match(/-?[\d\.]+/g);
        var xds = Math.abs(values[4]);
        if (e == 0) {
            translateXval = parseInt(xds) - parseInt(itemWidth * s);
            $(el + ' ' + rightBtn).removeClass("over");

            if (translateXval <= itemWidth / 2) {
                translateXval = 0;
                $(el + ' ' + leftBtn).addClass("over");
            }
        }
        else if (e == 1) {
            var itemsCondition = $(el).find(itemsDiv).width() - $(el).width();
            translateXval = parseInt(xds) + parseInt(itemWidth * s);
            $(el + ' ' + leftBtn).removeClass("over");

            if (translateXval >= itemsCondition - itemWidth / 2) {
                translateXval = itemsCondition;
                $(el + ' ' + rightBtn).addClass("over");
            }
        }
        $(el + ' ' + itemsDiv).css('transform', 'translateX(' + -translateXval + 'px)');
    }

    //It is used to get some elements from btn
    function click(ell, ee) {
        var Parent = "#" + $(ee).parent().attr("id");
        var slide = $(Parent).attr("data-slide");
        ResCarousel(ell, Parent, slide);
    }



    socket.on("changingVideo", (data)=>{
    	changeBorderCurrentVideo(data)
        if (sessionStorage.getItem('current_user') === sessionStorage.getItem('host')){
                player.cueVideoById(data);
        }
    })



    //playlist

    socket.on("deletingPlaylist", ()=>{
    	document.getElementById("video_playlist").innerHTML = "";
    	document.getElementById("video_playlist").innerHTML = '<div class="item" id="XqZsoesa55w-item"> \
    															<div class="pad15">\
    															   <a id="XqZsoesa55w-remove" class="float-right"> \
    															   <i class="fa fa-times-circle" style="font-size:18px;color:green"></i> \
                            										</a> \
    																<img src="https://img.youtube.com/vi/XqZsoesa55w/0.jpg" id="XqZsoesa55w" \
    																class="video_img ImageBorder" onclick="playVideo(this.id)">\
    															</div> \
    															</div>'
    	window.dispatchEvent(new Event('resize'));
        if (sessionStorage.getItem('current_user') === sessionStorage.getItem('host')){
            player.cueVideoById('XqZsoesa55w');
        }
        
    })



    socket.on("deletingVideo", (data)=>{
    	//console.log(data)
    	document.getElementById(data.delete_id + "-item").remove();
    	window.dispatchEvent(new Event('resize'));
        var message = "Video deleted!";
        showAlert(message, 'primary')
    	var current_videoId = data.current_id
    	if (current_videoId !== null){
    		document.getElementById(current_videoId).className += " ImageBorder";
    		player.cueVideoById(current_videoId);
    	}
    })


    socket.on("addingVideo", (data)=>{
    	createVideoElement(data)
    	window.dispatchEvent(new Event('resize'));
        var message = "Video succesfully added!";
    	showAlert(message, 'success')
	})


	socket.on("videoAlreadyInPlaylist", (data)=>{
        var message = "Video with id " + data + " already in Playlist";
		showAlert(message, 'warning')
	})


    socket.on('redirect', (destination)=>{
    	//console.log(destination)
    	window.location.href = destination;
    });



});  


function changeBorderCurrentVideo(data){
	var x = document.getElementsByClassName("ImageBorder")[0];
	x.classList.remove('ImageBorder');
	document.getElementById(data).className += " ImageBorder";
}


function createVideoElement(data){
	var videoInnerHtml = 	'<div class="item" id="' + data + '-item"> \
								<div class="pad15">  \
                        		<a onclick="deleteVideo(this.id)" id=' + data + '-remove class=\
                        		"float-right"><i class="fa fa-times-circle" style="font-size:18px;color:red"></i> \
                        		</a><img src="https://img.youtube.com/vi/' + data + '/0.jpg" id="' + data + '" class="video_img" onclick\
                        		="playVideo(this.id)"> \
                    		</div> \
                			</div> \
                			</div>';
    document.getElementById('video_playlist').innerHTML = document.getElementById('video_playlist').innerHTML + videoInnerHtml;
    //target.insertAdjacentElement('beforebegin', videoElement);        			
}



function logout(){
	//console.log(window.location.href)
	window.location.href="http://127.0.0.1:8080/auth/sign_in"
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
																	 + sender.first_name + " " + sender.last_name + 
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

	//console.log(chatElement);
													
	chatElementContainer.insertAdjacentHTML('beforeend', chatElement);
}

function createMemberElement(member_name, member_username, member_avatar){
	var memberElementContainer = document.getElementById("members-ul");
	var memberElement = "<a href='#' data-toggle='modal' data-target='#makeMeHostModal' class='list-group-item d-flex' id='" + member_username + "-item'> \
													<img src=/img/avatars/" + 
															member_avatar + ".png alt=''> \
													<div class='w-100'> \
															<div class='user-name small'>" +
																	member_name.first + " " + member_name.last +
															"</div> \
															<div class='text-muted small'>@" +
																	member_username +
															"</div> \
													</div> \
													<span class='ml-auto text-muted float-right' id='" + member_username + "-status'> \
															<i class='fa fa-circle'></i> \
													</span> \
											</li>"

	//console.log(memberElement)                   
											
	memberElementContainer.insertAdjacentHTML('beforeend', memberElement);
}


function removeMemberElement(member_username){
	var elementId = member_username + "-item"
	var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}



function onClickAddMemberButton(){
	var my_member = document.getElementById("addMemberInput").value
	var my_room = window.location.pathname.split("/").pop()
	socket.emit('add_member', {member: my_member, room: my_room});
    document.getElementById("addMemberInput").value = "";
}

function onClickLeaveRoomButton(){
	socket.emit("leave_room")
}




function onClickSendMessageButton(){
	var my_sender = sessionStorage.getItem("current_user");
	var my_message =  document.getElementById("myMessage").value;
	var my_room =  window.location.pathname.split("/").pop()
	socket.emit('send_message', {sender: my_sender, message: my_message, room: my_room})
	document.getElementById("myMessage").value = "";
}

function onClickDeletePlaylistButton(){
	socket.emit("deletePlaylist", {})
}

function onClickAddVideoButton(){
	var my_video = document.getElementById("addVideoInput").value
	var my_room = window.location.pathname.split("/").pop()
	socket.emit("addVideo", {video_id: my_video});
	document.getElementById("addVideoInput").value = "";
}

function deleteVideo(clicked_id){
	socket.emit("deleteVideo", clicked_id.substring( 0, clicked_id.indexOf("-remove" )));
}

function playVideo(clicked_id){
	socket.emit("change_video", clicked_id);
}


function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
}

function timedRefresh(timeoutPeriod) {
	setTimeout("location.reload(true);",timeoutPeriod);
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

function logout(){
	//console.log(window.location.href)
	window.location.href="http://127.0.0.1:8080/auth/sign_in"
}
