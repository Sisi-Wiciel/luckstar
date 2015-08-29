var roomService = require('./room/room.service');
var userService = require('../user/user.service');
var log = require('../../log');
var _ = require('lodash');

var RSVP = require('rsvp');

var updateRooms = function (socket) {
    log.debug("SOCKET: list rooms");

    roomService.list().then(function (result) {
        var promises = [];
        var rooms = _.map(result, function (room) {
            promises.push(userService.list(room.admin).then(function(user){
                room.admin = user;
            }));

            promises.push(userService.list(room.users).then(function(users){
                room.users = users;
            }));
            return room;
        })
        RSVP.all(promises).then(function(){
            socket.emit("rooms", rooms);
        })

    })

}

exports.register = function (socket) {
    socket.on('update rooms', function () {
        updateRooms(socket);
    });
};

exports.deregister = function (socket) {
    //userOffline(socket);
}