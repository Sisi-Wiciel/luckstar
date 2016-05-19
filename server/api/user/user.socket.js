var userService = require('./user.service');
var _ = require('lodash');
var log = require('../../log');
var moment = require('moment');
var settings = require('../../config/setting');

var updateUsers = function(socket, id) {

  userService.list(id).then(function(users) {
    if (!_.isEmpty(id)) {
      socket.emit("updateUser", _.first(users));
    } else {
      socket.io.emit("updateUsers", users);
    }
  });
};
exports.events = {
  userOnline: function(socket) {
    userService.online(socket.uid).then(function() {
      updateUsers(socket);
    });
  },
  userOffline: function(socket) {
    userService.offline(socket.uid).then(function() {
      updateUsers(socket);
    });
  },
  userUpdate: function(socket) {
    updateUsers(socket, socket.uid);
  },
  userGet: function(socket, cb) {
    if (_.isEmpty(socket.uid)) {
      cb({});
    } else {
      userService.list(socket.uid).then(function(user) {
        cb(user || {});
      });
    }
  },
  userChangeStatus: function(socket, status){
    if (status) {
      userService.changeStatus(socket.uid, settings.USER.STATUS[status]).then(function() {
        updateUsers(socket);
      })
    }
  },
  userSendMessage: function(socket, message) {

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
  }
};
exports.updateUsers = updateUsers;

exports.deregister = function(socket) {
  userService.offline(socket.uid).then(function() {
    updateUsers(socket);
  });
};



