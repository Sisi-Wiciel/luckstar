var userService = require('./user.service');
var _ = require('lodash');
var log = require('../../log');
var moment = require('moment');
var settings = require('../../config/setting');
var socketService = require('../socket/socket.service');
var updateUsers = function(socket, id) {

  userService.list(id).then(function(users) {
    if (!_.isEmpty(id)) {
      socket.emit("updateUser", _.first(users));
    } else {
      socketService.emitAll("updateUsers", users);
    }
  });
}

exports.register = function(socket) {

  socketService.on(socket, 'user online', function() {
    userService.online(socket.uid).then(function() {
      updateUsers(socket);
    });
  });

  socketService.on(socket, 'user offline', function() {
    userService.offline(socket.uid).then(function() {
      updateUsers(socket);
    });
  });

  socketService.on(socket, 'user update', function() {
    updateUsers(socket, socket.uid);
  });

  socketService.on(socket, 'user get', function(cb) {
    if (_.isEmpty(socket.uid)) {
      cb({});
    } else {
      userService.list(socket.uid).then(function(user) {
        cb(user || {});
      });
    }
  });

  socketService.on(socket, 'user change status', function(status) {
    if (status) {
      userService.changeStatus(socket.uid, settings.USER.STATUS[status]).then(function() {
        updateUsers(socket);
      })
    }
  });

  socketService.on(socket, 'send message', function(message) {

    userService.list([socket.uid, message.to]).then(function(result) {
      var fromUser = result[0];
      var toUser = result[1];

      var toSocket = socket.io.sockets.connected[toUser.sid];

      if (toSocket) {
        toSocket.emit('updateMessage', {
          from: fromUser,
          system: false,
          time: moment().format(),
          content: message.content
        });
      }
    })

  });

};

exports.updateUsers = updateUsers;

exports.deregister = function(socket) {
  userService.offline(socket.uid).then(function() {
    updateUsers(socket);
  });
};



