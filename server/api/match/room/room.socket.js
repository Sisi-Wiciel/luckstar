var roomService = require('./room.service.js');
var userService = require('../../user/user.service.js');
var log = require('../../../log');
var _ = require('lodash');

var RSVP = require('rsvp');

var updateRooms = function (socket) {
    roomService.list().then(function (rooms) {
        socket.io.emit("updateRooms", rooms);
    });
}

var usersInRoom = function (socket, id, cb) {
    if (!cb) {
        return;
    }

    roomService.list(id).then(function (rooms) {
        if (rooms && rooms.length == 1) {
            var room = rooms[0];

            userService.list(socket.uid).then(function (users) {
                cb(room, _.first(users)).then(function () {
                    console.info(room);
                    socket.io.sockets.in(room.id).emit('updateRoom', room);
                    updateRooms(socket);
                })
            })

        } else {
            log.error("usersInRoom: not found room ", id);
        }

    });
}

var joinRoom = function (socket, id) {
    usersInRoom(socket, id, function (room, user) {
        socket.room = id;
        socket.join(socket.room);
        if (!_.find(room.users, 'id', user.id)) {
            room.users.push(user);
        }
        return roomService.save(room);

    });
};

var leaveRoom = function (socket) {
    usersInRoom(socket, socket.room, function (room, user) {
        if(user.id === room.admin.id){
            socket.broadcast.to(socket.room).emit('closeRoom', '管理员已退出');
            room.admin = null;
        }

        _.remove(room.users, 'id', user.id);
        socket.leave(socket.room);
        socket.room = null;

        if (_.isEmpty(room.users) || _.isEmpty(room.admin)) {
            return roomService.remove(room);
        } else {
            return roomService.save(room);
        }

    });

}

var broadcastMsg = function (socket, msg) {
    socket.broadcast.to(socket.room).emit('updateMessage', msg);
};

exports.register = function (socket) {
    socket.on('update rooms', function () {
        updateRooms(socket);
    });

    socket.on('join room', function (id) {
        joinRoom(socket, id);
    });

    socket.on('leave room', function () {
        leaveRoom(socket);
    });

    socket.on('send room message', function (msg) {
        broadcastMsg(socket, msg);
    });
};

exports.deregister = function (socket) {
};