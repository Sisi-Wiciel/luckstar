var _ = require('lodash');
var setting = require('../../config/setting');
var io = require('socket.io').listen(setting.SOCKET.PORT);
var userService = require('../user/user.service');
var dbService = require('../redis/redis.service');
var jwt = require('jwt-simple');
var log = require('../../log');
var Promise = require('bluebird');

function loadSocketBundles (){
  return [
    require('../user/user.socket'),
    require('../room/room.socket'),
    require('../topic/topic.socket'),
    require('../room/compete.socket')
  ];
}

function disconnect(socket, reason) {
  userService.disconnect(socket.uid).then(function() {
    _.each(loadSocketBundles(), function(bundle) {
      bundle.deregister(socket);
    });
    socket.disconnect(reason);
  });
}

function clearSocket(socket){
  if(socket && socket.timeoutId){
    log.info('clear time out !!!');
    clearTimeout(socket.timeoutId);
    socket.timeoutId = null;
  }else{
    console.info('socket is null');
  }
}

function addEventsListener(socket) {
  _.each(loadSocketBundles(), function(bundle) {
    var events = bundle.events;
    _.each(_.functions(events), function(funcString) {

      socket.on(_.lowerCase(funcString), function(args, _cb) {
        preCallEventAuth(socket).then(function() {
          clearSocket(socket);
          socket.timeoutId = setTimeout(function() {
            log.info('User '+socket.uid +' inavtived', socket.timeoutId);
            disconnect(socket, 'unauthorized');
          }, setting.USER.INACTIVE_IN_SECOND);

          log.debug("Function " + funcString + " called");
          events[funcString](socket, args, _cb);
        });
      });
    });
  });
}

function onAuthenticate(socket) {
  socket.auth = false;
  //auth socket
  return new Promise(function(resolve) {
    socket.on('authenticate', function(data, callback) {
      //try {
      if (data && data.token) {
        var decoded = jwt.decode(data.token, setting.SECRET_KEY);
        if (decoded && decoded.id) {
          log.info("Authenticated socket with id", socket.id);
          socket.auth = true;
          socket.io = io;
          socket.uid = decoded.id;
          dbService.set("users:" + decoded.id, "sid", socket.id);

          addEventsListener(socket);
        }

        resolve(socket);
        callback(1); // auth successed and notify to client.
      } else {
        callback(0);
      }
      //} catch (err) {
      //  errorMessage = 'Connect socket error';
      //  log.error(err.message);
      //}
    });


  });
}

function preCallEventAuth(socket) {
  return new Promise(function(resolve, reject) {
    if (socket.uid && socket.auth) {
      resolve();
    } else {
      (function retry(times) {
        log.error("socket check failed, retry: " + times);
        setTimeout(function() {
          if (socket.connected) {
            if (socket.uid && socket.auth) {
              resolve();
            } else {
              if (times < setting.SOCKET.AUTH_MAX_RETRY_TIMES) {
                retry(++times);
              } else {
                socket.disconnect('unauthorized');
                log.error("socket check failed");
              }
            }
          } else {
            log.error("Socket was closed");
          }

        }, 1000);
      })(0);

    }
  }).then(function() {
    return userService.list(socket.uid).then(function(user) {
      if (!socket.room && user.room) {
        socket.room = user.room;
      }
    });
  });
}

module.exports = {
  getSocketByUser: function(user) {
    if (_.isEmpty(user)) {
      return null;
    }

    if (_.isEmpty(user.sid)) {
      return null;
    }
    return io.sockets.connected[user.sid];
  },
  emitAll: function(event, data) {
    io.emit(event, data);
  },
  createIO: function(cb, namespace) {
    if (namespace) {
      io = io.of(namespace);
    }

    io.on('connection', function(socket) {
      onAuthenticate(socket).then(cb);
      setTimeout(function() {
        if (!socket.auth) {
          log.info("Disconnecting unauthorized socket with id", socket.id);
          disconnect(socket, 'unauthorized');
        }
      }, setting.SOCKET.AUTH_TIME_OUT);
    });
    return io;
  },

  init: function() {

    this.createIO(function(socket) {
      socket.connectedAt = new Date();

      socket.on('disconnect', function() {
        var userid = socket.uid;
        clearSocket(socket);
        // ignore f5
        userService.disconnect(userid).then(function() {
          setTimeout(function() {
            userService.list(userid).then(function(user) {
              if (_.isEmpty(user.sid)) {
                disconnect(socket);
              } else {
                log.info("User reconnected immediately", user.id);
              }
            });
          }, 5000);
        });
      });

      log.info('Socket connected with id', socket.id);
    });
  },
  disconnect: function(socket, reason) {
    disconnect(socket, reason);
    log.info("Disconnecting socket with user", socket.uid);
  }
};

