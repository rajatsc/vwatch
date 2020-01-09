const express = require('express');
const db = require('../_setup/db');
const passportConfig = require('../_setup/passportConfig')

const router = express.Router();

//routes
router.post('/create', passportConfig.checkAuthentication, _createRoom)
router.get('/:room_url', passportConfig.checkAuthentication,  _getRoom)
router.delete('/:room_url', passportConfig.checkAuthentication, deleteRoom)


module.exports = router;

function _createRoom(req, res, next){

	//console.log("Inside create room")
		db.models.Room.createRoom({body: req.body, userid: req.user._id, user_name: req.user.userName})
			.then(function(room){
				var room = room;
				var updated_user = db.models.User.addRoomToUser(req.user, room._id);
				return Promise.all([updated_user, room]); 
			})
			.then(function([updated_user, room]){
				res.redirect('../users/' + updated_user.urlName)
			})
			.catch(err => next(err));
}

function _getRoom(req, res, next) {
	db.models.Room.getByUrlName(req.params.room_url)
		.then(function(room){
			if(room){
				res.render('room', {title: room.roomName, 
									room_name: room.roomName,
									owner: room.owner.userName, 
									members_array: room.members,
									playlist_array: room.playlist,
									current_video: room.current_video})
			}
			else{
				res.sendStatus(404)
			} 
		})
		.catch(err => next(err));
}


function deleteRoom(req, res, next){
	//console.log("Inside delete Room!!")
	var room_url = req.params.room_url;
	//console.log(room_url)
	db.models.Room.getByUrlName(room_url)
	.then((room)=>{
		if (room.owner_userName === req.user.userName){
			//console.log("Yes this is the owner")
			db.models.Room.deleteRoom(room_url)
			.then((data)=>{
				//console.log(data)
				var promises = [];
				for (i=0; i < data.members.length; i++){
					promises.push(db.models.User.deleteRoomFromUserUsingId(data.members[i], data._id))
				}
				return Promise.all(promises);
			})
			.then(()=>{
				res.send({'room': room_url});
			})
			.catch(err => next(err));
		}
		else{
			//console.log("No not the owner!")
			res.send({'room': null});
		}
	})
	.catch(err => next(err))
}