var rooms_set = new Set();

exports.getRooms = function _getRooms(){
	return rooms_set;
}

exports.addToRooms = function _addToRooms(my_room){
	rooms_set.add(my_room)
}

exports.searchForRoom = function _searchForRoom(my_room){
	return rooms_set.has(my_room)
}

exports.deleteFromRoom = function _deleteFromRoom(my_room){
	rooms_set.delete(my_room)
}