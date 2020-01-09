const tempRoom_mem = require('./tempRoom_memory')




var _default = async function _default(io){
	var tempRooms_nsp = io.of('/tempRooms');

	tempRooms_nsp.on('connection', async function(socket){

    socket.room = socket.handshake.query.room
		socket.user_name = randomString(4, 'aA#')
    socket.name = getRandomName();
    socket.avatar = Math.floor((Math.random() * 9) + 1);
    await socket.join(socket.room)
    console.log(tempRoom_mem.getRooms())
    console.log(tempRoom_mem.getRooms().has(socket.room))
    if (tempRoom_mem.getRooms().has(socket.room)){
      console.log("I am here")
      tempRooms_nsp.adapter.rooms[socket.room].memberSockets.add(socket.id)
      tempRooms_nsp.adapter.rooms[socket.room].memberInfo.set(socket.id, {name: socket.name, user_name: socket.user_name,
                                                              avatar: socket.avatar})
    }
    else{
      console.log("Inside room there")
      tempRoom_mem.addToRooms(socket.room);
      tempRooms_nsp.adapter.rooms[socket.room].memberSockets = new Set();
      tempRooms_nsp.adapter.rooms[socket.room].memberInfo = new Map();

      tempRooms_nsp.adapter.rooms[socket.room].memberSockets.add(socket.id)
      tempRooms_nsp.adapter.rooms[socket.room].memberInfo.set(socket.id, {name: socket.name, user_name: socket.user_name,
                                                              avatar: socket.avatar})
      tempRooms_nsp.adapter.rooms[socket.room].host = socket.user_name
    }

    
    socket.emit("set_session", socket.user_name)
    tempRooms_nsp.in(socket.room).emit("user_online", Array.from(tempRooms_nsp.adapter.rooms[socket.room].memberInfo.values()))
    socket.broadcast.to(socket.room).emit("new_user");

    /////Set Host////
    tempRooms_nsp.in(socket.room).emit("set_host", tempRooms_nsp.adapter.rooms[socket.room].host)

    ///////   Listen to Send message ////

      socket.on('send_message', function(data){
      console.log('Inside send message')
      var my_sender = data.sender 
      var my_message = data.message
      var my_room = data.room
      tempRooms_nsp.in(socket.room).emit('receive_message', 
          {sender: {
            user_name: socket.user_name,
            name: socket.name,  
            avatar: socket.avatar}, 
            message: my_message
          });
    })

        
		socket.on('disconnect', function(data){
        socket.leave(socket.room, ()=>{
          tempRooms_nsp.in(socket.room).emit("user_offline", socket.user_name)
          
          if (tempRooms_nsp.adapter.rooms[socket.room]){
            tempRooms_nsp.adapter.rooms[socket.room].memberSockets.delete(socket.id);
            tempRooms_nsp.adapter.rooms[socket.room].memberInfo.delete(socket.id)
            
            if (socket.user_name === tempRooms_nsp.adapter.rooms[socket.room].host){
              var random_host = getRandomItem(tempRooms_nsp.adapter.rooms[socket.room].memberSockets)
              tempRooms_nsp.adapter.rooms[socket.room].host = tempRooms_nsp.adapter.rooms[socket.room].memberInfo.get(random_host).user_name
              tempRooms_nsp.in(socket.room).emit("set_host", tempRooms_nsp.adapter.rooms[socket.room].host)
            }

            

            console.log("Not the last member leaving room!")
          }
          else{
            console.log("Last member leaving socket!")
            tempRoom_mem.deleteFromRoom(socket.room)
          }  
        })
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
      //console.log("Listening Sync me with host!!!")
      //also sync other sockets with same username
      tempRooms_nsp.in(socket.room).emit("getHostData", {caller_socketId: socket.id})
    })




    socket.on('receiveHostData', (data)=>{
      socket.broadcast.to(data.caller_socketId).emit('sync', data.hostData);
    })


	})
}


function getRandomName() {
  const adjs = ["autumn", "hidden", "bitter", "misty", "silent", "empty", "dry", "dark", "summer", "icy", "delicate", "quiet", "white", "cool", "spring", "winter", "patient", "twilight", "dawn", "crimson", "wispy", "weathered", "blue", "billowing", "broken", "cold", "damp", "falling", "frosty", "green", "long", "late", "lingering", "bold", "little", "morning", "muddy", "old", "red", "rough", "still", "small", "sparkling", "throbbing", "shy", "wandering", "withered", "wild", "black", "young", "holy", "solitary", "fragrant", "aged", "snowy", "proud", "floral", "restless", "divine", "polished", "ancient", "purple", "lively", "nameless"];
  const nouns = ["waterfall", "river", "breeze", "moon", "rain", "wind", "sea", "morning", "snow", "lake", "sunset", "pine", "shadow", "leaf", "dawn", "glitter", "forest", "hill", "cloud", "meadow", "sun", "glade", "bird", "brook", "butterfly", "bush", "dew", "dust", "field", "fire", "flower", "firefly", "feather", "grass", "haze", "mountain", "night", "pond", "darkness", "snowflake", "silence", "sound", "sky", "shape", "surf", "thunder", "violet", "water", "wildflower", "wave", "water", "resonance", "sun", "wood", "dream", "cherry", "tree", "fog", "frost", "voice", "paper", "frog", "smoke", "star"];
  return (
	adjs[Math.floor(Math.random() * adjs.length)] +
	"_" +
	nouns[Math.floor(Math.random() * nouns.length)]
  );
}



function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16);
}

// get random item from a Set
function getRandomItem(set) {
    let items = Array.from(set);
    return items[Math.floor(Math.random() * items.length)];
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

exports.default = _default;