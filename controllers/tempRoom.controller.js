const express = require('express');
const router = express.Router();
const tempRoom_mem = require('../_helpers/tempRoom_memory');


//routes
router.get('/', _getAllRooms)
router.post('/create', _createRoom)
router.get('/:roomid', _getRoom)
router.post('/join', _joinRoom)
//router.delete('/:roomid', _deleteRoom)

module.exports = router

function _getAllRooms(req, res, next){
  res.send('Hello World!!!')
}

function _createRoom(req, res, next){
  var roomid = randomString(8, 'aA#');
  res.redirect(roomid);
}

function _getRoom(req, res, next){
  //res.send(req.params.roomid)
  res.render('temp_room', {title: req.params.roomid});
}

function _joinRoom(req, res, next){
  if (tempRoom_mem.searchForRoom(req.body.temp_room_name)){
    res.redirect(req.body.temp_room_name)
  }
  else{
    res.render('tempRoom_404', {room_name: req.body.temp_room_name})
  }
  
}

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