const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

var RoomSchema = new mongoose.Schema ({
	
	roomName: {
		type: String,
		required: true
	},

	urlName: {
		type: String,
		required: true
	},

	owner: {
			type: mongoose.Schema.Types.ObjectId, ref: 'User'
	},

	owner_userName: {
		type: String,
		required: true
	},
	
	members: [{ 
		type: mongoose.Schema.Types.ObjectId, ref: 'User'
	}],

	current_video: {
		type: Number
	},
	
	playlist: [{
		type: String
	}],

	createdDate: {
		type: Date, 
		default: Date.now
	}
});

RoomSchema.set('toJSON', { virtuals: true });


//=====================================//
/******    statics     ******/
//=====================================//

//createRoom
RoomSchema.statics.createRoom = async function(params){
	var member = params.userid;
	var owner_id = params.userid;
	var owner_userName = params.user_name;
	var room_name = params.body.room_name;
	var url_name = randomString(8, 'aA#');

	const new_room = new this(
		{
			roomName: room_name,
			owner: owner_id,
			owner_userName: owner_userName,
			members: [member],
			urlName: url_name,
			current_video: 0,
			playlist: ['XqZsoesa55w']
		}
	);

	var saved_room = await new_room.save();

	/*
	this.on('index', async function(){
		var saved_user = await new_user.save();
	})
	*/
	return saved_room;
}

//getById
RoomSchema.statics.getById = async function(id){
	return await this.findById(id).populate('members').populate('owner').select();
}

//getByUrlName
RoomSchema.statics.getByUrlName = async function(url_name){
	return await this.findOne({urlName: url_name}).populate('members').populate('owner').select();
}


//addMemberToRoom
RoomSchema.statics.addMemberToRoom = async function(member_id, room_url){
	var query = {'urlName': room_url};
	var updated_room = await this.findOneAndUpdate(query, 
			{ $push: { members: member_id } }, {
  new: true
})
}

//deleteMemberFromRoom
RoomSchema.statics.deleteMemberFromRoom = async function(member_id, room_url){
	var query = {'urlName': room_url};
	var updated_room = await this.findOneAndUpdate(query, 
			{ $pull: { members: member_id } }, {
				new: true})

	if (updated_room.members.length === 0){
		var deleted_user = await this.findOneAndRemove(query)
	}

} 

//add video to Playlist

RoomSchema.statics.addVideoToPlaylist = async function(video_id, room_url){
	var query = {'urlName': room_url}
	var updated_room = await this.findOneAndUpdate(query,
			{ $push: {playlist: video_id}}, {
				new: true
			})
	return updated_room;
}


//delete video from Playlist

RoomSchema.statics.deleteVideoFromPlaylist = async function(video_id, room_url){
	var query = {'urlName': room_url};
	var updated_room = await this.findOneAndUpdate(query, 
			{ $pull: { playlist: video_id }}, {
				new: true
			})
	return updated_room;
}


//change current video
RoomSchema.statics.changeCurrentVideo = async function(video_index, room_url){
	var query = {'urlName': room_url};
	const update = { current_video: video_index };
	var updated_room = await this.findOneAndUpdate(query, update, {new: true});
	return updated_room;
}

//delete entire Playlist


RoomSchema.statics.deletePlaylist = async function(room_url){
	var query = {'urlName': room_url};
	var updated_room = await this.findOneAndUpdate(query, { $set: { playlist: [] }}, {new: true})
	var updated_room = await this.addVideoToPlaylist('XqZsoesa55w', room_url, {new: true})
	return updated_room;
}


//delete Room
RoomSchema.statics.deleteRoom = async function(room_url){
	var x = await this.findOneAndRemove({'urlName': room_url})
	return x;
}

//=====================================//
/**********    methods     ************/
//=====================================//




//helper functions
function randomString(length, chars) {
    var mask = '';
    if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
    if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (chars.indexOf('#') > -1) mask += '0123456789';
    if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
    var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)];
    return result;
}


module.exports = mongoose.model('Room', RoomSchema);