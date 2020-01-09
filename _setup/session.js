
const mongoose = require('mongoose')
const expressSession = require('express-session')
const connectMongo = require('connect-mongo');
const path = require('path')
const dotenv = require('dotenv');
dotenv.config({ path: 'dev.env' });

const MongoStore = connectMongo(expressSession);

var session_config = {
	name: 'server-session-cookie-id',
	store: new MongoStore({ mongooseConnection: mongoose.connection ,
		autoRemove: 'native'}),
	secret: process.env.SESSION_SECRET,
	saveUninitialized: true,
	resave: false,
	cookie: {
		path: "/",
		maxAge: 600000
	}
}


module.exports.sessionMiddleware = expressSession(session_config);

