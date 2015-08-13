var io = require('socket.io').listen(8889),
  userSocket = require('../api/user/user.socket');
redis = require('../config/redis');
var jwt = require('jwt-simple');

function onConnect(socket){
  userSocket.register(socket);
}

function onDisconnect(socket){
  userSocket.deregister(socket);
}

module.exports = {
  createIO: function(cb, namespace){
    if(namespace){
      io = io.of(namespace);
    }

    io.on('connection', function (socket) {
      socket.auth = false;
      socket.on('authenticate', function(data){
        try {
          var decoded = jwt.decode(data.token, "LuCk_StAr_SeCrEt");
          if(decoded && decoded._id){

            socket.auth = true;
            socket.io = io;

            redis.setUserSid(decoded._id, socket.id);
          }

          cb(socket);

        } catch (err) {
          console.error(err);
          console.log("Authenticated socket ", socket.id);
        }
      });

      setTimeout(function(){
        if (!socket.auth) {
          console.log("Disconnecting socket ", socket.id);
          socket.disconnect('unauthorized');
        }
      }, 1000);

    });
    return io;
  },

  init: function(){

    this.createIO(function(socket){
      socket.connectedAt = new Date();

      socket.on('disconnect', function () {
        onDisconnect(socket);
        console.log("Disconnecting socket ", socket.id);
      });

      onConnect(socket);
      console.info('SOCKET CONNECTED WITH id ', socket.id);
    });

  }
}
