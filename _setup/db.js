const mongoose = require('mongoose'); //require mongoose module
const chalk = require('chalk');  //require chalk module to give colors to console text
const dotenv = require('dotenv');
const path = require('path');

var connected = chalk.bold.cyan;
var error = chalk.bold.yellow;
var disconnected = chalk.bold.red;
var termination = chalk.bold.magenta;


dbURL = 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@vwatch-cluster-wpbov.mongodb.net/' + process.env.DB + '?retryWrites=true&w=majority';  




var options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

mongoose.connect(dbURL , options);

mongoose.connection.on('connected', function(){
        console.log(connected("Mongoose default connection is open to ", dbURL));
});

mongoose.connection.on('error', function(err){
        console.log(error("Mongoose default connection has occured "+err+" error"));
});

mongoose.connection.on('disconnected', function(){
        console.log(disconnected("Mongoose default connection is disconnected"));
});

process.on('SIGINT', function(){
        mongoose.connection.close(function(){
            console.log(termination("Mongoose default connection is disconnected due to application termination"));
            process.exit(0)
    });
});


module.exports = {
  models: {
    User: require('../models/user.model'),
    Room: require('../models/room.model')
  }
};