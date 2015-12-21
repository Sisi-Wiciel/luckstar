var userService = require('./user.service');
var _ = require('lodash');
var log = require('../../log');
var moment = require('moment');
var settings = require('../../config/setting');

var updateUsers = function (socket, id) {
    userService.list(id).then(function (users) {
        if(!_.isEmpty(id)){
            socket.emit("updateUser", _.first(users));
        }else{
            socket.io.emit("updateUsers", users);
        }

    });
}

exports.register = function (socket) {
    var ss = require('../socket/socket.service');

    ss.on(socket, 'user online', function () {
        userService.online(socket.uid).then(function () {
            updateUsers(socket);
        });
    })

    ss.on(socket, 'user offline', function () {
        userService.offline(socket.uid).then(function () {
            updateUsers(socket);
        })
    });

    ss.on(socket, 'user update', function () {
        updateUsers(socket, socket.uid);
    });

    ss.on(socket, 'user change status', function (status) {
        if (status) {
            userService.changeStatus(socket.uid, settings.USER.STATUS[status]).then(function () {
                updateUsers(socket);
            })
        }

    });

    ss.on(socket, 'send message', function (message) {

        userService.list([socket.uid, message.to]).then(function (result) {
            var fromUser = result[0];
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

exports.updateUsers =updateUsers;

exports.deregister = function (socket) {
    //if (socket.uid) {
        //userService.offline(socket.uid).then(function () {
        //    updateUsers(socket);
        //})
    //}

};