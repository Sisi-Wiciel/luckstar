var redis = require('../../config/redis');

var userOnline = function(socket, id){
  socket.uid = id;

  redis.changeUserStatus(id, 1);

  redis.getUsersWithStatus(function (users) {
    socket.io.emit("users", users);
  });
}

var userOffline = function(socket){
  var id = socket.uid;
  if(socket.uid){
    redis.changeUserStatus(id, 0);
    redis.getUsersWithStatus(function (users) {
      socket.broadcast.emit("users", users);
    });
  }
}

exports.register = function (socket) {
  socket.on('user online', function (id) {
    userOnline(socket, id);
  });

  socket.on('user offline', function () {
    userOffline(socket);
  });
};

exports.deregister = function (socket) {
  userOffline(socket);
}