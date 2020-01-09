//module dependencies
const http = require('http');
const express = require('express');
const bodyparser = require('body-parser');
const chalk = require('chalk');
const path = require('path');
const errorHandler = require('errorhandler');
const dotenv = require('dotenv');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const socketio = require('socket.io');

const session = require('./_setup/session')
const passportConfig = require('./_setup/passportConfig')

//connect to database and websocket server
const db = require('./_setup/db');

//load environment variables from .env file,
//where API keys and passwords are configured
dotenv.config({ path: 'dev.env' });

//create express server
var app = express();

//security
app.disable('x-powered-by');

//express configuration
app.set('host', process.env.HOST);
app.set('port', process.env.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

//Error Handler.
if (process.env.NODE_ENV === 'development') {
  // only use in development
  app.use(errorHandler());
} else {
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Server Error');
  });
}


//start express server
//console.log(__dirname)
//console.log(__filename)


//session and passport


if (process.env.NODE_ENV === 'production'){
	app.set('trust proxy', 1) // trust first proxy

  /*
  //in production environment redirect all http to https
  app.use(function(request, response){
    if(!request.secure){
      response.redirect("https://" + request.headers.host + request.url);
    }
  });
  */
}

app.use(session.sessionMiddleware);



passportConfig.default(app);


//socket stuff
var server = http.createServer(app);
var io = socketio(server);
io.use(function(socket, next) {
    session.sessionMiddleware(socket.request, {}, next);
});
app.set('socketio', io);
var ws_room = require('./_helpers/ws_room').default(io);
var ws_tempRoom = require('./_helpers/ws_tempRoom').default(io);

//route handlers
const homeController = require('./controllers/home.controller');
const authController = require('./controllers/auth.controller')
const userController = require('./controllers/user.controller');
const tempRoomController = require('./controllers/tempRoom.controller');
const roomController = require('./controllers/room.controller');

//primary app routes
app.use('/', homeController);
app.use('/auth', authController)
app.use('/users', userController);
app.use('/temp_rooms', tempRoomController);
app.use('/rooms', roomController);



server.listen(app.get('port'), () => {
	console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'), app.get('port'), app.get('env'));
	console.log('  Press CTRL-C to stop\n');
})

module.exports = app;