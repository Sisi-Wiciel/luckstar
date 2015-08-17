var redis = require('../redis/redis.service');

var log = require('../../log');

var userOnline = function(socket, id){
  log.debug("received user online event", id);
  socket.uid = id;

  redis.changeUserStatus(id, 1);


  redis.getUsersWithStatus('', function (users) {
    socket.io.emit("users", users);
  });
}

var userOffline = function(socket){
  log.debug('received user offline event');
  var id = socket.uid;

  if(socket.uid){
    redis.changeUserStatus(id, 0);
    redis.getUsersWithStatus('', function (users) {
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


  socket.on('send message', function(message){
    redis.getUsersWithStatus(message.to, function (toUser) {

      redis.getUsersWithStatus(message.from, function (fromUser) {
        var toSocket = socket.io.sockets.connected[toUser[0].sid];
        if(toSocket){
          toSocket.emit('receive messages', {
            from: fromUser[0],
            content: message.content
          })
        }

      });

    });
  });
};

exports.deregister = function (socket) {
  userOffline(socket);
}