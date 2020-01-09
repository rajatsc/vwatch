const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');


dotenv.config({ path: 'dev.env' });

var min_avatar = 1;
var max_avatar = 9;


var validateEmail = function(email) {
	var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	return re.test(email)
};


const UserSchema = new mongoose.Schema({
	email: {
		type: String,
		trim: true,
		lowercase: true,
		unique: true,
		required: 'Email address is required',
		validate: [validateEmail, 'Please fill a valid email address'],
		match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
	},

	name: {
        first : {
        	type: String,
        	required: true
        }
      , last  : {
      		type: String,
      		required: true
      }
    },
	
	userName: {
		type: String, 
		required: true, 
		unique:true
	},

	urlName: {
		type: String,
		required: true, 
		unique:true
	},

	avatar:     { 
		type: Number, 
		min: min_avatar, 
		max: max_avatar 

	},

	myRooms: [{
		type: mongoose.Schema.Types.ObjectId, ref: 'Room'
	}],
	
	hash: { 
		type: String, 
		required: true
	},
	
	createdDate: {
		type: Date, 
		default: Date.now 
	}
});

/*

schema.set(
	option, value
	);

*/


//====================================//
/*************    pre     ************/
//===================================//




UserSchema.set('toJSON', { virtuals: true });




//=====================================//
/******    statics     ******/
//=====================================//

//create user
UserSchema.statics.createUser = async function(params){

	var first_name = params.first;
	var last_name = params.last;
	var email = params.email;
	var password = params.password;
	var user_name = params.username;
	var hash = bcrypt.hashSync(password, 10);
	var url_name = randomString(6, 'aA#');
	var my_avatar =  getRandomInt(min_avatar, max_avatar);

	const new_user = new this(
		{	
			name: {
				first: first_name,
				last: last_name
			},
			email: email,
			userName: user_name,
			hash: hash,
			urlName: url_name,
			avatar: my_avatar
		}
	);

	/*
	this.on('index', async function(){
		var saved_user = await new_user.save();
	})
	*/
	var saved_user = await new_user.save();

	return saved_user;
}


//find by name
UserSchema.statics.getByName = async function(name) {
	return await this.findOne({ userName: name }).populate('myRooms').select('-hash');
}


//delete
UserSchema.statics.delete = async function(id) {
	await this.findByIdAndRemove(id).select('-hash');
}


//get By Id
UserSchema.statics.getById = async function(id) {
	return await this.findById(id).populate('myRooms').select('-hash');
}

//getByUrlName
UserSchema.statics.getByUrlName = async function(url_name){
	return await this.findOne({urlName: url_name}).populate('myRooms').select();
}


//getAll
UserSchema.statics.getAll = async function(){
	return await this.find({});
}

//AddRoomtoUser
UserSchema.statics.addRoomToUser = async function(member, room){
	var updated_user = await this.findByIdAndUpdate(
		member,
		{ $push: { "myRooms": room}}, {
			new: true})
	return updated_user
}

//DeleteRoomFromUser
UserSchema.statics.deleteRoomFromUser = async function(member, room){
	var query = {'userName': member}
	var updated_user = await this.findOneAndUpdate(query, 
		{ $pull: {'myRooms': room } }, {
				new: true})
}


//DeleteRoomFromUser
UserSchema.statics.deleteRoomFromUserUsingId = async function(member, room){
	var query = {'_id': member}
	var updated_user = await this.findOneAndUpdate(query, 
		{ $pull: {'myRooms': room } }, {
				new: true})
}

//======================================//
/******    methods     ******/
//======================================//



UserSchema.methods.validatePassword = function(password) {
	var result = bcrypt.compareSync(password, this.hash)
	return result;
}


//functions

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


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


//exports
module.exports = mongoose.model('User', UserSchema);