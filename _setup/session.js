
const mongoose = require('mongoose')
const expressSession = require('express-session')
const connectMongo = require('connect-mongo');
const path = require('path')
const dotenv = require('dotenv');

const MongoStore = connectMongo(expressSession);

var session_config = {
	name: 'server-session-cookie-id',
	store: new MongoStore({ mongooseConnection: mongoose.connection ,
		autoRemove: 'native'}),
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
	resave: false,
	cookie: {
		secure: false,
		httpOnly: true,
		path: "/",
		maxAge: 600000
	}
}

/*
if (process.env.NODE_ENV === 'production'){
	session_config.cookie.secure = true; //serve secure cookies 
}
*/


module.exports.sessionMiddleware = expressSession(session_config);

