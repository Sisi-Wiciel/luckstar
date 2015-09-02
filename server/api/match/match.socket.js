var roomService = require('./room/room.service');
var userService = require('../user/user.service');
var log = require('../../log');
var _ = require('lodash');

var RSVP = require('rsvp');

var updateRooms = function (socket) {
    log.debug("SOCKET: list rooms");

    roomService.list().then(function (rooms) {
        socket.io.emit("rooms", rooms);
    });
}

var usersInRoom = function(socket, id, cb){
    if(!cb){
        return;
    }

    roomService.list(id).then(function (rooms) {
        if(rooms && rooms.length == 1){
            var room = rooms[0];

            userService.list(socket.uid).then(function (users) {
                if (cb(room, _.first(users))) {
                    updateRooms(socket);
                    roomService.save(_.clone(room));
                }
            })
        }

    });
}
var joinRoom = function(socket, id){
    usersInRoom(socket, id, function(room, user){
        if(!_.find(room.users, 'id', user.id)) {
            room.users.push(user);
            return true;
        }else{
            return false;
        }

    });
};

var leaveRoom = function(socket, id){
    usersInRoom(socket, id, function(room, user){
        if(_.find(room.users, 'id', user.id)) {
            _.remove(room.users, 'id', user.id);
            return true;
        }else{
            return false;
        }

    });
}

exports.register = function (socket) {
    socket.on('update rooms', function () {
        updateRooms(socket);
    });

    socket.on('join room', function(id){
        joinRoom(socket, id);
    });
    socket.on('leave room', function(id){
        leaveRoom(socket, id);
    });
};

exports.deregister = function (socket) {
}