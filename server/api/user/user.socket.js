var userService = require('./user.service');
var _ = require('lodash');
var log = require('../../log');
var moment = require('moment');

var userOnline = function (socket, id) {
    log.debug("SOCKET: received user online event", id);
    socket.uid = id;
    userService.changeStatus(id, 1).then(function () {
        userService.list().then(function (users) {
            socket.io.emit("updateUser", users);
        });
    });
}

var userOffline = function (socket) {
    log.debug('SOCKET: received user offline event');
    var id = socket.uid;

    if (socket.uid) {
        userService.changeStatus(id, 0).then(function () {
            userService.list().then(function (users) {
                socket.broadcast.emit("users", users);
            });
        })

    }
}

exports.register = function (socket) {
    socket.on('user online', function (id) {
        userOnline(socket, id);
    });

    socket.on('user offline', function () {
        userOffline(socket);
    });

    socket.on('send message', function (message) {

        userService.list([socket.uid, message.to]).then(function(result){
            var fromUser= result[0];
            var toUser = result[1];

            var toSocket = socket.io.sockets.connected[toUser.sid];

            if (toSocket) {
                toSocket.emit('updateMessage', {
                    from: fromUser,
                    system: false,
                    time: moment().format(),
                    content: message.content
                })
            }
        })

    });
};

exports.deregister = function (socket) {
    userOffline(socket);
}