var setting = require('../../config/setting');
var io = require('socket.io').listen(setting.SOCKET.PORT);
var userSocket = require('../user/user.socket');
var redis = require('../redis/redis.service');
var jwt = require('jwt-simple');
var log = require('../../log');

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
          var decoded = jwt.decode(data.token, setting.SECRET_KEY);
          if(decoded && decoded._id){
            log.debug("Authenticated socket with id", socket.id);
            socket.auth = true;
            socket.io = io;

            redis.setUserSid(decoded._id, socket.id);
          }

          cb(socket);

        } catch (err) {
          log.error(err.message);
        }
      });

      setTimeout(function(){
        if (!socket.auth) {
          log.debug("Disconnecting socket with id", socket.id);
          socket.disconnect('unauthorized');
        }
      }, setting.SOCKET.AUTH_TIME_OUT);

    });
    return io;
  },

  init: function(){

    this.createIO(function(socket){
      socket.connectedAt = new Date();

      socket.on('disconnect', function () {
        onDisconnect(socket);
        log.debug("Disconnecting socket with id", socket.id);
      });

      onConnect(socket);
      log.info('Socket connected with id', socket.id);
    });

  }
}