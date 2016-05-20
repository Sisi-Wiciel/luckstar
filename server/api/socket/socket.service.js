var _ = require('lodash');
var setting = require('../../config/setting');
var io = require('socket.io').listen(setting.SOCKET.PORT);
var userSocket = require('../user/user.socket');
var roomSocket = require('../room/room.socket');
var userService = require('../user/user.service');
var topicSocket = require('../topic/topic.socket');
var completeSocket = require('../room/compete.socket');
var db = require('../redis/redis.service');
var jwt = require('jwt-simple');
var log = require('../../log');
var Promise = require('bluebird');

function onConnect(socket) {
  userSocket.register(socket);
  roomSocket.register(socket);
  completeSocket.register(socket);
  topicSocket.register(socket);
}

function onDisconnect(socket) {
  userSocket.deregister(socket);
  roomSocket.deregister(socket);
  completeSocket.deregister(socket);
  topicSocket.deregister(socket);
}

module.exports = {
  getSocketByUser: function(user) {
    return io.sockets.connected[user.sid];
  },
  emitAll: function(event, data) {
    io.emit(event, data);
  },
  auth: function(socket) {
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
  },

  on: function(socket, key, cb) {
    var self = this;
    socket.on(key, function(args, _cb) {
      this.auth(socket).then(function() {
        socket.timeoutId && clearTimeout(socket.timeoutId);
        socket.timeoutId = setTimeout(function() {
          log.info('User inavtived', socket.uid);
          self.disconnect(socket, 'unauthorized');
        }, setting.USER.INACTIVE_IN_SECOND);

        cb(args, _cb);
      });
    }.bind(this));

  },
  createIO: function(cb, namespace) {
    var self = this;
    if (namespace) {
      io = io.of(namespace);
    }

    io.on('connection', function(socket) {
      socket.auth = false;
      socket.on('authenticate', function(data, cbToClient) {
        try {
          if (data && data.token) {
            var decoded = jwt.decode(data.token, setting.SECRET_KEY);
            if (decoded && decoded.id) {
              log.info("Authenticated socket with id", socket.id);
              socket.auth = true;
              socket.io = io;
              socket.uid = decoded.id;
              db.set("users:" + decoded.id, "sid", socket.id);
            }

            cb(socket);
            cbToClient(1); // auth successed and notify to client.
          } else {
            log.error("invalid token data");
            cbToClient(0);
          }
        } catch (err) {
          log.error("Connect to socket failed", err.message);
        }
      });

      setTimeout(function() {
        if (!socket.auth) {
          log.info("Disconnecting unauthorized socket with id", socket.id);
          self.disconnect(socket, 'unauthorized');
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
                self.disconnect(socket);
              } else {
                log.info("User reconnected immediately", user.id);
              }
            });
          }, 1500);
        });
      });
      onConnect(socket);
      log.info('Socket connected with id', socket.id);
    });
  },
  disconnect: function(socket, reason) {
    userService.disconnect(socket.uid).then(function() {
      onDisconnect(socket);
      socket.disconnect(reason);
    });
    log.info("Disconnecting socket with user", socket.uid);
  }

};

