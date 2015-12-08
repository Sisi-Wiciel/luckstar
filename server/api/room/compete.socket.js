var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var roomService = require('./room.service');
var roomSocket = require('./room.socket');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var settings = require('../../config/setting');

var nodifyRoom = function (socket, key, obj) {
    socket.io.sockets.in(socket.room).emit(key, obj);
};

var nodifyVerdict = function (socket, room, verdictObj) {
    log.info("NodifyVerdict");

    nodifyRoom(socket, 'topicVerdict', verdictObj);

    roomService.updateRoomStat(room, verdictObj).then(function (competeStat) {
        if (verdictObj.verdict == 0) {
            roomSocket.sendRoomMessage(socket, "第" + competeStat.currNum + "题: 用户" + verdictObj.user.username + "回答错误", true);
        } else if (verdictObj.verdict == 1) {
            roomSocket.sendRoomMessage(socket, "第" + competeStat.currNum + "题: 用户" + verdictObj.user.username + "回答正确", true);
        } else if (verdictObj.verdict == -1) {
            roomSocket.sendRoomMessage(socket, "第" + competeStat.currNum + "题: 答题超时", true);
        }


        setTimeout(function () {
            nodifyRoom(socket, 'updateRoomStat', competeStat);
            if (competeStat.currNum >= competeStat.maxNum) {

                roomService.finishCompete(room, competeStat).then(function () {
                    roomSocket.updateRooms(socket);

                    _.each(competeStat.users, function (user) {
                        userService.updatePoint(user.userid, user.point);
                    })
                })
            } else {
                nextTopic(socket);
            }
            //nodifyRoom(socket, 'updateRoomStat', competeStat);
        }, 2000);

    })
};
var topicCountDown = function (socket, topic) {
    log.info("TopicCountDown");
    var number = settings.ROOM.COMPETE_TOPIC_COUNTDOWN;
    (function countdown () {
        setTimeout(function () {

            if (socket.room) {
                roomService.list(socket.room).then(function (rooms) {
                    var room = rooms[0];
                    if (room && room.topic && room.topic === topic._id && room.status == 1) {
                        if (number > 0) {
                            nodifyRoom(socket, 'updateTopicCountdown', --number);
                            countdown();
                        } else {
                            nodifyVerdict(socket, room, {
                                verdict: -1
                            });
                        }
                    }

                });
            }

        }, 1000);

    }).call(this);
};

function nextTopic (socket) {
    log.info("NextTopic");
    var self = this;
    roomService.list(socket.room).then(function (rooms) {
        var room = rooms[0];

        topicService.get().then(function (topic) {

            delete topic.correct;

            nodifyRoom(socket, 'topicUpdate', topic);

            roomService.update(room, function (locked) {
                locked.topic = topic._id;
            }).then(function () {
                topicCountDown(socket, topic);
            })

        });
    })
};

function checkTopic (socket, answer) {
    log.info("CheckTopic");
    var self = this;

    Promise.props({
        'users': userService.list(socket.uid),
        'rooms': roomService.list(socket.room)
    }).then(function (results) {
        var user = results.users[0];
        var room = results.rooms[0];

        topicService.isCorrect(room.topic, answer).then(function (verdictObj) {
            verdictObj.user = user;
            verdictObj.opt = answer;
            nodifyVerdict(socket, room, verdictObj);
        });
    });
};

var getTopic = function (socket) {
    roomService.list(socket.room).then(function (rooms) {
        var room = rooms[0];
        if (room && room.topic) {
            topicService.get(room.topic).then(function (topic) {
                delete topic.correct;
                socket.emit('topicUpdate', topic);
            });
        } else {
            log.warn("no current topic in this competition");
        }

    })
}

exports.checkTopic = checkTopic;

exports.nextTopic = nextTopic;

exports.register = function (socket) {
    var ss = require('../socket/socket.service');
    ss.on(socket, 'complete get topic', function () {
        getTopic(socket);
    });

    ss.on(socket, 'complete check topic', function (answer) {
        checkTopic(socket, answer);
    });
};

exports.deregister = function (socket) {
};