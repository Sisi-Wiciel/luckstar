var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var roomService = require('./room.service');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var RSVP = require('rsvp');

var TOPIC_COUNT_DOWN = 15;

var topicCountDown = function(socket, topic){
    var number = TOPIC_COUNT_DOWN;
    (function countdown () {
        setTimeout(function () {
            // topic 绑定到一个room上面
            // 每秒钟都去redis查room的topic 有没有被改变.
            // 其实room绑定到socket最好, 就不用去redis 拿room信息了, 要每一个client的socket都绑定topic. 这样会存在问题 比如 刷新浏览器socket信息就没了

            if(socket.room){
                roomService.list(socket.room).then(function (rooms) {
                    var room = rooms[0];
                    if (room && room.topic && room.topic === topic._id) {
                        if (number > 0) {
                            socket.io.sockets.in(socket.room).emit('topicUpdateCountdown', --number);
                            countdown();
                        } else {
                            socket.io.sockets.in(socket.room).emit('topicVerdict', {
                                verdict: -1
                            });
                            self.nextTopic(socket);
                        }
                    }
                });
            }


        }, 1000);

    }).call(this);
};

exports.nextTopic = function (socket) {
    var self = this;
    roomService.list(socket.room).then(function (rooms) {
        var room = rooms[0];

        topicService.get().then(function (topic) {

            room.topic = topic._id;

            socket.io.sockets.in(socket.room).emit('topicUpdate', topic);

            roomService.save(room).then(function () {
                topicCountDown(socket, topic);
            })

        });
    })
};

exports.checkTopic = function (socket, answer) {
    var self = this;

    RSVP.hash({
        'users': userService.list(socket.uid),
        'rooms': roomService.list(socket.room)
    }).then(function(results) {
        var user = results.users[0];
        var room = results.rooms[0];

        topicService.isCorrect(room.topic, answer).then(function () {
            return 1;
        }, function () {
            return 0;
        }).then(function (verdict) {
            socket.io.sockets.in(socket.room).emit('topicVerdict', {
                user: user,
                verdict: verdict
            });
            self.nextTopic(socket);
        })
    });
};

exports.register = function (socket) {
    var self = this;
    socket.on('complete next topic', function () {
        self.nextTopic(socket);
    });

    socket.on('complete check topic', function (answer) {
        self.checkTopic(socket, answer);
    });
};

exports.deregister = function (socket) {
};