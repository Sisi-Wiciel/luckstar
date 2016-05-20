var _ = require('lodash');
var setting = require('../../config/setting');
var io = require('socket.io').listen(setting.SOCKET.PORT);
var userService = require('../user/user.service');
var dbService = require('../redis/redis.service');
var jwt = require('jwt-simple');
var log = require('../../log');
var Promise = require('bluebird');

var socketBundles = [
  require('../user/user.socket'),
  require('../room/room.socket'),
  require('../user/user.service'),
  require('../topic/topic.socket'),
  require('../room/compete.socket')
];

function register(socketBundle, socket) {

}

function disconnect(socket, reason) {
  userService.disconnect(socket.uid).then(function() {
    _.each(socketBundles, function(bundle) {
      bundle.deregister(socket);
    });
    socket.disconnect(reason);
  });
}

function addEventsListener(socket) {
  _.each(socketBundles, function(bundle) {
    var events = bundle.events;
    _.each(_.functions(events), function(funcString) {

      socket.on(_.lowerCase(funcString), function(args, _cb) {
        preCallEventAuth(socket).then(function() {
          socket.timeoutId && clearTimeout(socket.timeoutId);
          socket.timeoutId = setTimeout(function() {
            log.info('User inavtived', socket.uid);
            disconnect(socket, 'unauthorized');
          }, setting.USER.INACTIVE_IN_SECOND);

          console.info("Function " + funcString + " called", events[funcString]);
          events[funcString](socket, args, _cb);
        });
      });
    });
  });
}

function onAuthenticate(socket) {
  socket.auth = false;
  //auth socket
  return new Promise(function(resolve, reject) {
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
        log.error('Invalid token data');
        reject('Invalid token data');
        callback(0);
      }
      //} catch (err) {
      //  errorMessage = 'Connect socket error';
      //  log.error(err.message);
      //}
    });


  });
};

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
  //preCallEventAuth: function(socket) {
  //  return preCallEventAuth(socket);
  //},
  createIO: function(cb, namespace) {
    var self = this;
    if (namespace) {
      io = io.of(namespace);
    }

    io.on('connection', function(socket) {
      onAuthenticate(socket).then(cb);
      setTimeout(function() {
        if (!socket.auth) {
          log.info("Disconnecting unauthorized socket with id", socket.id);
          disconnect('unauthorized');
        }
      }, setting.SOCKET.AUTH_TIME_OUT);
    });
    return io;
  },

  init: function() {

    //setInterval(function() {
    //  console.info('connected socket numbers for now, ' + io.sockets.sockets.length);
    //}, 5000);
    var self = this;
    this.createIO(function(socket) {
      socket.connectedAt = new Date();

      socket.on('disconnect', function() {
        var userid = socket.uid;
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
          }, 1500);
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

