var roomService = require('./room.service');
var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var competeSocket = require('./compete.socket');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var setting = require('../../config/setting');

var updateRooms = function (socket) {
    log.info("UpdateRooms");
    roomService.list().then(function (rooms) {
        if(socket.room){
            var currRoom = _.find(rooms, "id", socket.room);
            socket.io.sockets.in(socket.room).emit('updateRoom', currRoom);
        }

        socket.io.emit("updateRooms", rooms);
    });
}

var getAndUpdateRoom = function (socket, id, cb) {
    log.info("GetAndUpdateRoom");
    if (!cb) {
        return;
    }

    roomService.list(id).then(function (rooms) {
        if (rooms && rooms.length == 1) {
            var room = rooms[0];

            userService.list(socket.uid).then(function (users) {
                var postGET = function(){
                    updateRooms(socket);
                }

                var promise = cb(room, _.first(users));
                promise && promise.then(postGET) || postGET();
            })

        } else {
            if(socket.room === id){
                socket.leave(id);
                socket.room = null
            }
            log.error("getAndUpdateRoom: not found room ", id);
        }

    });
}

var joinRoom = function (socket, id) {
    log.info("JoinRoom");
    socket.room = id;
    getAndUpdateRoom(socket, id, function (room, user) {

        socket.join(socket.room);
        if (!_.find(room.users, 'id', user.id)) {

            sendSystemMessage(socket, '用户' + user.username + '加入房间');
            return roomService.save(room, function(locked){
                locked.users.push(user);
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
            socket.io.sockets.in(socket.room).emit('closeRoom');
        }
        socket.leave(room);
        _.remove(room.users, 'id', user.id);

        sendSystemMessage(socket, '用户' + user.username + '离开房间');

        socket.room = null;
        if (_.isEmpty(room.users) || _.isEmpty(room.admin)) {
            return roomService.remove(room);
        }else{
            return roomService.save(room);
        }

    });
}

var sendSystemMessage = function (socket, content) {
    socket.io.sockets.in(socket.room).emit('updateRoomMessage', {
        content: content,
        system: true,
        time: moment().format()
    });
}

var sendChatMessage = function (socket, msg) {
    msg.system = false;
    msg.time = moment().format();
    socket.broadcast.to(socket.room).emit('updateRoomMessage', msg);
};

var readyRoomCompete = function(socket){
    log.info("ReadyRoomCompete")
    getAndUpdateRoom(socket, socket.room, function (room, user) {
        if(room.admin.id !== user.id){
            log.error('readyRoomCompete: Only admin user can start competition');
            return;
        }
        return new Promise(function(resolve, reject) {
            var countdown = 2;

            (function doCountDown(){
                setTimeout(function(){
                    if(countdown == 0){
                        room.status = 1 ;
                        resolve(roomService.save(room));
                    }else{
                        sendSystemMessage(socket, countdown-- + '秒后答题开始..');
                        doCountDown();
                    }
                }, 1000);
            }).call(this);
        });
    });
};

var startRoomCompete = function(socket){
    log.info("StartRoomCompete");

    getAndUpdateRoom(socket, socket.room, function (room, user) {

        if(room.readyUsers.indexOf(user.id) > -1){
            return ;
        }

        roomService.save(room, function(locked){
            locked.readyUsers.push(user.id);
            sendSystemMessage(socket, '用户' +user.username + '已准备就绪.');
        }).then(function(room){
            console.info("ready user length : ", room.readyUsers, room.users);
            if(room.readyUsers.length == room.users.length){
                competeSocket.nextTopic(socket);
            }
        });
    });
};

exports.register = function (socket) {
    socket.on('update rooms', function () {
        updateRooms(socket);
    });

    socket.on('join room', function (id) {
        joinRoom(socket, id);
    });

    socket.on('leave room', function () {
        leaveRoom(socket);
    });

    socket.on('send room message', function (msg) {
        sendChatMessage(socket, msg);
    });

    socket.on('ready compete', function(){
        readyRoomCompete(socket);
    })
    socket.on('start compete', function(){
        startRoomCompete(socket);
    })
};

exports.deregister = function (socket) {
    //leaveRoom(socket);
};