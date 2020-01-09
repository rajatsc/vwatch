//modules
const db = require('../_setup/db');
const chalk = require('chalk');

//variables
var socketMembers = new Map()
var onlineRooms = new Set()
var onlineRoomMembers = new Map()
var onlineMembers = new Map()

var _default = async function _default(io){

	var rooms_nsp = io.of('/rooms');


	rooms_nsp.on('connection', async function(socket){
		
	if (socket.request.session.passport){
		//get room from socket query
		var current_room = socket.handshake.query.room
		//console.log("Printing current room")
		//console.log(current_room)
		//join room
		await socket.join(current_room);
	 	socket.room = current_room;
	 	
		socket.user = socket.request.session.passport.user
		//console.log("Printing socket user from session passport!!")
		//console.log(socket.user)
		var current_user = await db.models.User.getByName(socket.request.session.passport.user)

		if (onlineRooms.has(socket.room)){
			
			if(rooms_nsp.adapter.rooms[socket.room].members.has(socket.user)){
				rooms_nsp.adapter.rooms[socket.room].members_info.get(socket.user).instances =
					rooms_nsp.adapter.rooms[socket.room].members_info.get(socket.user).instances + 1;

			} 
			else{

				rooms_nsp.adapter.rooms[socket.room].members.add(socket.user);
				rooms_nsp.adapter.rooms[socket.room].members_info.set(
							socket.user, 
							{
							first_name: current_user.name.first,
							last_name: current_user.name.last,
							avatar: current_user.avatar,
							instances: 1
							})
			}

			//send only to this socket id
			//socket.emit('set_host', rooms_nsp.adapter.rooms[socket.room].host)

		}
		else{
			var my_room = await db.models.Room.getByUrlName(socket.room);
			rooms_nsp.adapter.rooms[socket.room].playlist = my_room.playlist
			rooms_nsp.adapter.rooms[socket.room].current_video = my_room.current_video;
			
			onlineRooms.add(socket.room);
			rooms_nsp.adapter.rooms[socket.room].host = socket.user;

			rooms_nsp.adapter.rooms[socket.room].members = new Set();
			rooms_nsp.adapter.rooms[socket.room].members_info = new Map();

			rooms_nsp.adapter.rooms[socket.room].members.add(socket.user); 		
			rooms_nsp.adapter.rooms[socket.room].members_info.set(
							socket.user, 
							{
							first_name: current_user.name.first,
							last_name: current_user.name.last,
							avatar: current_user.avatar,
							instances: 1
							})
			


			//rooms_nsp.in(socket.room).emit('set_host', rooms_nsp.adapter.rooms[socket.room].host)
			
		}

		rooms_nsp.in(socket.room).emit("user_online", Array.from(rooms_nsp.adapter.rooms[socket.room].members));
		//console.log(Array.from(rooms_nsp.adapter.rooms[socket.room].members))


		//===============================//
		//********* Set Host ***********//
		//==============================//

		socket.emit("set_sessionStorage", socket.user)
		socket.emit("find_me", socket.user)
		socket.emit('set_host', rooms_nsp.adapter.rooms[socket.room].host)
		//==============================//
		/****** Disconnect socket *******/
		//==============================//		


		//====================================//
		//******** Change Video **************//
		//====================================//

		socket.on("change_video", (data)=>{
			//console.log(data)
			//console.log(socket.user);
			if (socket.user == rooms_nsp.adapter.rooms[socket.room].host){
				//console.log("I am host and I am here inside change video!!")
				var video_index = rooms_nsp.adapter.rooms[socket.room].playlist.indexOf(data);
				db.models.Room.changeCurrentVideo(video_index, socket.room)
				.then((updated_room)=>{
					//console.log("Printing current video index")
					//console.log(updated_room.current_video)
					rooms_nsp.adapter.rooms[socket.room].current_video = updated_room.current_video;
					rooms_nsp.in(socket.room).emit("changingVideo", updated_room.playlist[updated_room.current_video]);
				})
				.catch(err => {console.log(err)})
				
			}
		})
	
		

		//======================================//
		/************* Send Host Data **********/
		//=====================================//
		socket.on("get_host_data", ()=>{
			socket.emit("sending_host_data", rooms_nsp.adapter.rooms[socket.room].host)
		})


		//======================================//
		/************** Add member *************/
		//=====================================//

		socket.on('add_member', async function(data){
			//console.log(data.member)
			//console.log(data.room)

			//console.log("Inside add_member")
			var user = await db.models.User.getByName(data.member)
			var room = await db.models.Room.getByUrlName(socket.room)
			//console.log(user)
			//console.log(room)
			//console.log(user.toObject)
			//user doesn't exist
			if (user == null){
				rooms_nsp.in(current_room).emit('add_member_response', {response: 0, member: data.member})
			} else{

				var user_already_in_room = user.myRooms.filter(function (my_room) {
    				//console.log(my_room)
    				return my_room.roomName === room.roomName;
  				}).pop();

  				//console.log(user_already_in_room)

  				if (typeof user_already_in_room === "undefined"){
  					db.models.Room.addMemberToRoom(user._id, data.room)
					.then(()=>{
						db.models.User.addRoomToUser(user._id, room._id);
					})
					.then(()=>{
						rooms_nsp.in(current_room).emit('add_member_response', {response: 1, member: user.toObject()})	
					})
					.catch(err => {console.log(err)})
  				}
  				else{
  					rooms_nsp.in(current_room).emit('add_member_response', {response: 2, member: user.toObject()})
  				}

				

			}
			//search in database
			//if not found reply with 
			//no user found
			//else
			//check if user already in room, if yes
			//reply user already in room
			//reply with user added
		})


		//==================================//
		//***********Send Message **********//
		//==================================//
		socket.on('send_message', function(data){
			//console.log('Inside send message')
			var my_sender = data.sender 
			var my_message = data.message
			var my_room = data.room
			rooms_nsp.in(socket.room).emit('receive_message', 
					{sender: {
						user_name: my_sender,
						first_name: rooms_nsp.adapter.rooms[my_room].members_info.get(my_sender).first_name, 
						last_name: rooms_nsp.adapter.rooms[my_room].members_info.get(my_sender).last_name, 
						avatar: rooms_nsp.adapter.rooms[my_room].members_info.get(my_sender).avatar},
						message: my_message
					});
		})


		//================================//
		socket.on('leave_room', async function(){
			//console.log("Listening to leave room");
			var my_room = await db.models.Room.getByUrlName(socket.room)
			if (my_room.owner_userName === socket.user){
				socket.emit("cannotLeaveRoom")
			}
			else{
				var my_user = await db.models.User.getByName(socket.user)
				db.models.Room.deleteMemberFromRoom(my_user._id, socket.room)
				.then(()=>{
					db.models.User.deleteRoomFromUser(socket.user, my_room._id)
				})
				.then(()=>{
					rooms_nsp.in(socket.room).emit('leavingRoom', socket.user);
				})
				.catch(err => {console.log(err)})	
			}
			
		})


		//=================================//
		//******** updateHostData *********//
		//=================================//

		socket.on('updateHostData', (data)=>{
			//console.log(data);
			rooms_nsp.adapter.rooms[socket.room].hostData = data;
		})


		//===================================//
		//********** receiveHostData ********//
		//===================================//

		socket.on('receiveHostData', (data)=>{
			socket.broadcast.to(data.caller_socketId).emit('sync', data.hostData);
		})



		//=================================//
		//****** syncOthersWithHost *******//
		//=================================//

		socket.on('syncOthersWithHost', (data)=>{
			socket.broadcast.to(socket.room).emit("sync", data);
		})



		//===================================//
		//******* syncMeWithHost ************//
		//===================================//

		socket.on('syncMeWithHost', ()=>{
			rooms_nsp.in(socket.room).emit("getHostData", {caller_socketId: socket.id})
		})



		socket.on('play_next', ()=>{
			if (socket.user == rooms_nsp.adapter.rooms[socket.room].host){

				if (rooms_nsp.adapter.rooms[socket.room].current_video < rooms_nsp.adapter.rooms[socket.room].playlist.length - 1){
					db.models.Room.changeCurrentVideo(rooms_nsp.adapter.rooms[socket.room].current_video + 1, socket.room)
					.then((updated_room)=>{
						rooms_nsp.adapter.rooms[socket.room].current_video = updated_room.current_video;
						var video_index = rooms_nsp.adapter.rooms[socket.room].current_video
						var video_id = rooms_nsp.adapter.rooms[socket.room].playlist[video_index];
						socket.emit("changingVideo", video_id);
					})
					.catch(err => {console.log(err)})
				}
			}
		})


		socket.on('play_previous', ()=>{
			//console.log("Listening to play previous")
			if (socket.user == rooms_nsp.adapter.rooms[socket.room].host){
				if (rooms_nsp.adapter.rooms[socket.room].current_video > 0){
					db.models.Room.changeCurrentVideo(rooms_nsp.adapter.rooms[socket.room].current_video -1, socket.room)	
					.then((updated_room)=>{
						rooms_nsp.adapter.rooms[socket.room].current_video = updated_room.current_video;
						var video_index = rooms_nsp.adapter.rooms[socket.room].current_video
						var video_id = rooms_nsp.adapter.rooms[socket.room].playlist[video_index];
						socket.emit("changingVideo", video_id);
					})
					.catch(err => {console.log(err)})	
				}
			}
		})



		socket.on("deletePlaylist", ()=>{
			db.models.Room.deletePlaylist(socket.room)
			.then((updated_room)=>{
				rooms_nsp.in(socket.room).emit("deletingPlaylist", {})	
			})
			.catch(err => {console.log(err)})
			
		})


		socket.on("deleteVideo", (data)=>{
			var deleted_video_index = rooms_nsp.adapter.rooms[socket.room].playlist.indexOf(data);
			db.models.Room.deleteVideoFromPlaylist(data, socket.room)
			.then((updated_room)=>{
				rooms_nsp.adapter.rooms[socket.room].playlist = updated_room.playlist;
				
				if (deleted_video_index === rooms_nsp.adapter.rooms[socket.room].current_video){
					if (deleted_video_index >= rooms_nsp.adapter.rooms[socket.room].current_video){
						rooms_nsp.in(socket.room).emit("deletingVideo", {'delete_id': data, 'current_id':rooms_nsp.adapter.rooms[socket.room].playlist[rooms_nsp.adapter.rooms[socket.room].playlist.length -1]});
					}
						rooms_nsp.in(socket.room).emit("deletingVideo", {'delete_id': data, 'current_id':rooms_nsp.adapter.rooms[socket.room].playlist[deleted_video_index]});	
				}

				if (deleted_video_index < rooms_nsp.adapter.rooms[socket.room].current_video){
					db.models.Room.changeCurrentVideo(rooms_nsp.adapter.rooms[socket.room].current_video - 1, socket.room);		
				}
			})
			.then((updated_room)=>{
				if (updated_room){
					rooms_nsp.adapter.rooms[socket.room].current_video = updated_room.current_video
					rooms_nsp.in(socket.room).emit("deletingVideo", {'delete_id': data, 'current_id':null});					
				}
			})
			.catch(err => {console.log(err)})
		})

		socket.on("addVideo", (data)=>{
			//console.log("Listening to socket add video")
			//console.log(data)
			if (!rooms_nsp.adapter.rooms[socket.room].playlist.includes(data.video_id)){
				db.models.Room.addVideoToPlaylist(data.video_id, socket.room)
				.then((updated_room)=>{
					rooms_nsp.adapter.rooms[socket.room].playlist = updated_room.playlist;
					rooms_nsp.in(socket.room).emit("addingVideo", data.video_id);	
				})
				.catch(err => {console.log(err)})
			} else{
				socket.emit("videoAlreadyInPlaylist", data.video_id);	
			}
		})

}
else{
	var destination = '../auth/sign_in';
	socket.emit('redirect', destination);
}


		socket.on('disconnect', function(data){
		var my_user = socket.user;
		var my_room = socket.room;


		socket.leave(socket.room, ()=>{
			rooms_nsp.in(my_room).emit("user_offline", my_user);
			
			if (rooms_nsp.adapter.rooms[my_room]){
				if (rooms_nsp.adapter.rooms[my_room].members_info.get(my_user).instances == 1){
					rooms_nsp.adapter.rooms[my_room].members.delete(my_user);
					rooms_nsp.adapter.rooms[my_room].members_info.delete(my_user)

				if (my_user == rooms_nsp.adapter.rooms[socket.room].host){
					console.log("Host is getting deleted");
					console.log("Randomly making someone else host");
					rooms_nsp.adapter.rooms[current_room].host = 
						getRandomItem(rooms_nsp.adapter.rooms[my_room].members);
					console.log("Server side setting unsetting host")
					rooms_nsp.in(current_room).emit("unset_host", my_user)
					rooms_nsp.in(current_room).emit("set_host", rooms_nsp.adapter.rooms[my_room].host)	
			}

			} else {
				rooms_nsp.adapter.rooms[socket.room].members_info.get(my_user).instances = 
					rooms_nsp.adapter.rooms[socket.room].members_info.get(my_user).instances - 1; 
				
			}	
			}
			else{
				onlineRooms.delete(my_room);
			}
			
		})
		
	})



	})
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       


// get random item from a Set
function getRandomItem(set) {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
}



function getCookie(name, cookie) {
    var c;
    cookies = cookie.split('; ');
    for (var i=0; i < cookies.length; i++) {
        c = cookies[i].split('=');
        if (c[0] == name) {
            return c[1];
        }
    }
    return "";
}


exports.default = _default;