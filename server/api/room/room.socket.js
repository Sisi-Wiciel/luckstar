var roomService = require('./room.service');
var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var competeSocket = require('./compete.socket');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var setting = require('../../config/setting');

var updateRooms = function (socket, roomid) {
    log.info("UpdateRooms");

    roomService.list().then(function (rooms) {
        var roomid = roomid || socket.room;
        if (!_.isEmpty(rooms) && roomid) {
            var currRoom = _.find(rooms, "id", roomid);
            socket.io.sockets.in(roomid).emit('updateRoom', currRoom);
        }

        socket.io.emit("updateRooms", rooms);
    });
};

var sendRoomMessage = function (socket, message, isSystem) {
    log.info("SendRoomMessage");

    socket.io.sockets.in(socket.room).emit('updateRoomMessage', {
        message: message,
        system: isSystem,
        time: moment().format()
    });
};

var getAndUpdateRoom = function (socket, id, cb) {
    log.info("GetAndUpdateRoom");
    if (!cb) {
        return;
    }

    roomService.list(id).then(function (rooms) {
        if (rooms && rooms.length == 1) {
            var room = rooms[0];

            userService.list(socket.uid).get(0).then(function (user) {

                var promise = cb(room, user);
                promise && promise.then(function () {
                    updateRooms(socket, room.id);
                });
            })

        } else {
            if (socket.room === id) {
                socket.leave(id);
                socket.room = null
            }
            log.warn("getAndUpdateRoom: not found room ", id);
        }

    });
};

var joinRoom = function (socket, id) {
    log.info("JoinRoom", id);
    socket.room = id;

    getAndUpdateRoom(socket, id, function (room, user) {

        //管理员默认在room.users里面, 如果这句话放倒if中,管理员将得不到房间的消息通知.
        socket.join(socket.room);

        if (!_.find(room.users, 'id', user.id)) {

            return roomService.update(room, function (locked) {
                if (locked.users.length < locked.number) {
                    locked.users.push(user);

                    sendRoomMessage(socket, '用户' + user.username + '加入房间', true);
                } else {
                    locked.obs.push(user);
                }

            });
        }

    });
};

var leaveRoom = function (socket) {
    log.info("LeaveRoom");
    var room = socket.room;

    getAndUpdateRoom(socket, room, function (room, user) {

        if (user.id === room.admin.id) {
            room.admin = null;
            socket.io.sockets.in(socket.room).emit('cd');
        }
        socket.leave(room);

        sendRoomMessage(socket, '用户' + user.username + '离开房间', true);

        socket.room = null;
        if (_.isEmpty(room.users) || _.isEmpty(room.admin)) {
            return roomService.remove(room);
        } else {
            return roomService.update(room, function (locked) {
                _.remove(locked.users, 'id', user.id);
            });
        }

    });
};



var startRoomCompete = function (socket) {
    log.info("StartRoomCompete");
    getAndUpdateRoom(socket, socket.room, function (room, user) {
        if (room.admin.id !== user.id) {
            log.error('startRoomCompete: Only admin user can start competition');
            return;
        }
        if (room.readyUsers.length == room.users.length) {

            setTimeout(function () {
                roomService.createCompeteState(room).then(function (roomStat) {
                    socket.io.sockets.in(socket.room).emit('updateRoomStat', roomStat);
                });
                competeSocket.nextTopic(socket);
            }, 6000);

            return roomService.startCompete(room);
        } else {
            socket.io.sockets.in(socket.room).emit('RoomAlert', '需要全部用户进入等待状态后才可以开始');
        }

    });
};

var unreadyRoomCompete = function (socket) {
    log.info("UnReadyRoomCompete");

    getAndUpdateRoom(socket, socket.room, function (room, user) {

        roomService.update(socket.room, function (locked) {
            var userIndex = locked.readyUsers.indexOf(user.id);

            if (userIndex > -1) {
                _.pullAt(locked.readyUsers, userIndex);
                sendRoomMessage(socket, '用户' + user.username + '取消准备.', true);

                socket.io.sockets.in(socket.room).emit('updateRoom', locked);
            } else {
                log.warn("User %s was not in ready status yet ", user.id);
            }

        })
    });
};
var readyRoomCompete = function (socket) {
    log.info("ReadyRoomCompete");

    getAndUpdateRoom(socket, socket.room, function (room, user) {

        roomService.update(socket.room, function (locked) {
            if (locked.readyUsers.indexOf(user.id) == -1) {
                locked.readyUsers.push(user.id)

                sendRoomMessage(socket, '用户' + user.username + '准备就绪.', true);
                socket.io.sockets.in(socket.room).emit('updateRoom', locked);
            } else {
                log.warn("User %s was in ready status ", user.id);
            }

        })

    });
};
var terminateRoomCompete = function (socket) {
    log.info("TerminateRoomCompete");

    getAndUpdateRoom(socket, socket.room, function (room, user) {
        return roomService.terminateCompete(room).then(function () {
            sendRoomMessage(socket, '管理员已终止答题', true);
        });
    });
};

var getRoomStat = function (socket) {
    log.info("GetRoomStat, " + socket.room);
    roomService.listRoomStat(socket.room).then(function (roomstat) {
        if (roomstat) {
            socket.emit("updateRoomStat", roomstat);
        }

    });
};

exports.updateRooms = updateRooms;
exports.sendRoomMessage = sendRoomMessage;

exports.register = function (socket) {
    var socketSrv = require('../socket/socket.service');

    socketSrv.on(socket, 'update rooms', function () {
        updateRooms(socket);
    });

    socketSrv.on(socket, 'join room', function (id) {
        joinRoom(socket, id);
    });

    socketSrv.on(socket, 'leave room', function () {
        leaveRoom(socket);
    });

    socketSrv.on(socket, 'send room message', function (msg) {
        sendRoomMessage(socket, msg, false);
    });

    socketSrv.on(socket, 'ready compete', function () {
        readyRoomCompete(socket);
    });
    socketSrv.on(socket, 'unready compete', function () {
        unreadyRoomCompete(socket);
    });
    socketSrv.on(socket, 'start compete', function () {
        startRoomCompete(socket);
    })
    socketSrv.on(socket, 'terminate compete', function () {
        terminateRoomCompete(socket);
    })
    socketSrv.on(socket, 'room get stat', function () {
        getRoomStat(socket);
    })
    socketSrv.on(socket, 'room create', function (room, cb) {
        roomService.save(room, socket.uid).then(function (room) {
            updateRooms(socket);
            return room;
        }).then(cb);
    })
};

exports.deregister = function (socket) {
    //leaveRoom(socket);
};