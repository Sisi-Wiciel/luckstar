var roomService = require('./room.service');
var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var competeSocket = require('./compete.socket');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var RSVP = require('rsvp');
var setting = require('../../config/setting');

var updateRooms = function (socket) {
    roomService.list().then(function (rooms) {
        socket.io.emit("updateRooms", rooms);
    });
}

var getAndUpdateRoom = function (socket, id, cb) {
    if (!cb) {
        return;
    }

    roomService.list(id).then(function (rooms) {
        if (rooms && rooms.length == 1) {
            var room = rooms[0];

            userService.list(socket.uid).then(function (users) {
                var postGET = function(){
                    socket.io.sockets.in(room.id).emit('updateRoom', room);
                    updateRooms(socket);
                }

                var promise = cb(room, _.first(users));

                promise && promise.then(postGET) || postGET();
            })

        } else {
            log.error("getAndUpdateRoom: not found room ", id);
        }

    });
}

var joinRoom = function (socket, id) {
    socket.room = id;
    getAndUpdateRoom(socket, id, function (room, user) {

        socket.join(socket.room);
        if (!_.find(room.users, 'id', user.id)) {
            room.users.push(user);
            sendSystemMessage(socket, '用户' + user.username + '加入房间');
            return roomService.save(room);
        }

    });
};

var leaveRoom = function (socket) {
    var room = socket.room;
    getAndUpdateRoom(socket, room, function (room, user) {

        if (user.id === room.admin.id) {
            room.admin = null;
        }

        _.remove(room.users, 'id', user.id);

        socket.leave(room);

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

    getAndUpdateRoom(socket, socket.room, function (room, user) {
        if(room.admin.id !== user.id){
            log.error('readyRoomCompete: Only admin user can start competition');
            return;
        }
        return new RSVP.Promise(function(resolve, reject) {
            var countdown = 2;

            (function doCountDown(){
                setTimeout(function(){
                    if(countdown == 0){
                        room.status = 1 ;
                        roomService.save(room).then(function(){
                            resolve();
                        })
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
    getAndUpdateRoom(socket, socket.room, function (room, user) {
        if(!room.readyUsers){
            room.readyUsers = [];
        }
        if(room.readyUsers.indexOf(user.id) > -1){
            return ;
        }

        room.readyUsers.push(user.id);
        console.info(room.readyUsers);
        sendSystemMessage(socket, '用户' +user.username + '已准备就绪.');


        roomService.save(room).then(function(){
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