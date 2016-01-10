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

function onConnect (socket) {
    userSocket.register(socket);
    roomSocket.register(socket);
    completeSocket.register(socket);
    topicSocket.register(socket);
}

function onDisconnect (socket) {
    userSocket.deregister(socket);
    roomSocket.deregister(socket);
    completeSocket.deregister(socket);
    topicSocket.deregister(socket);
}

module.exports = {
    _authCall: function (socket) {
        return new Promise(function (resolve, reject) {
            if (socket.uid && socket.auth) {
                resolve();
            } else {
                (function _retry (times) {
                    log.error("socket check failed, retry: " + times);
                    setTimeout(function () {
                        if (socket.uid && socket.auth) {
                            resolve();
                        } else {
                            if (times < setting.SOCKET.AUTH_MAX_RETRY_TIMES) {
                                _retry(++times);
                            } else {
                                reject();
                                log.error("socket check failed");
                            }
                        }

                    }, 1000);
                })(0)

            }
        }).then(function () {
                return userService.list(socket.uid).get(0).then(function (user) {
                    if(!socket.room  && user.room){
                        socket.room = user.room;
                    }

                });
            });

    },

    on: function (socket, key, cb) {
        socket.on(key, function (args, _cb) {
            log.info("Socket on event,", key, args);
            this._authCall(socket).then(function () {
                cb(args, _cb);
            });
        }.bind(this));

    },
    createIO: function (cb, namespace) {
        if (namespace) {
            io = io.of(namespace);
        }

        io.on('connection', function (socket) {
            socket.auth = false;
            socket.on('authenticate', function (data) {
                try {
                    if(data && data.token){
                        var decoded = jwt.decode(data.token, setting.SECRET_KEY);
                        if (decoded && decoded._id) {
                            log.debug("Authenticated socket with id", socket.id);
                            socket.auth = true;
                            socket.io = io;
                            socket.uid = decoded._id;
                            db.set("users:" + decoded._id, "sid", socket.id);
                        }

                        cb(socket);
                    }else{
                        log.error("no data or data token");
                    }
                } catch (err) {
                    log.error("connect socket error", err.message);
                }
            });

            setTimeout(function () {
                if (!socket.auth) {
                    log.debug("Disconnecting socket with id", socket.id);
                    socket.disconnect('unauthorized');
                }
            }, setting.SOCKET.AUTH_TIME_OUT);

        });
        return io;
    },

    init: function () {

        this.createIO(function (socket) {
            socket.connectedAt = new Date();

            socket.on('disconnect', function () {
                onDisconnect(socket);
                log.debug("Disconnecting socket with id", socket.id);
            });

            onConnect(socket);
            log.debug('Socket connected with id', socket.id);
        });

    }
};
