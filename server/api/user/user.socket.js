var redis = require('../../config/redis');

var userOnline = function(socket, id){
  socket.uid = id;

  redis.changeUserStatus(id, 1);

  redis.getUsersWithStatus('', function (users) {
    socket.io.emit("users", users);
  });
}

var userOffline = function(socket){
  var id = socket.uid;
  console.info("user offline ", id);
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
    //todo 这样写好丑啊!!!
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