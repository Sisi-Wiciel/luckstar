var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var roomService = require('./room.service');
var roomScoket = require('./room.socket');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');

var TOPIC_COUNT_DOWN = 15;

var nodifyRoom = function(socket, key, obj){
    socket.io.sockets.in(socket.room).emit(key, obj);
}
var nodifyVerdict = function(socket, room, verdictObj){
    log.info("NodifyVerdict");

    nodifyRoom(socket, 'topicVerdict', verdictObj);

    roomService.updateRoomStat(room, verdictObj).then(function(roomStat){
        if(roomStat.currNum > roomStat.maxNum){
            roomService.finishCompete(room, roomStat).then(function(){
                nodifyRoom(socket, 'updateRoomStat', roomStat);
                roomScoket.updateRooms(socket);
            })
        }else{
            nodifyRoom(socket, 'updateRoomStat', roomStat);
            nextTopic(socket);
        }

    })
}
var topicCountDown = function (socket, topic) {
    log.info("TopicCountDown");
    var number = TOPIC_COUNT_DOWN;
    (function countdown () {
        setTimeout(function () {
            // topic 绑定到一个room上面
            // 每秒钟都去redis查room的topic 有没有被改变.
            // 其实room绑定到socket最好, 就不用去redis 拿room信息了, 要每一个client的socket都绑定topic. 这样会存在问题 比如 刷新浏览器socket信息就没了

            if (socket.room) {
                roomService.list(socket.room).then(function (rooms) {
                    var room = rooms[0];
                    if (room && room.topic && room.topic === topic._id && room.status == 1) {
                        if (number > 0) {
                            nodifyRoom(socket, 'updateTopicCountdown', --number);
                            countdown();
                        } else {
                            nodifyVerdict(socket, room,{
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

            room.topic = topic._id;

            nodifyRoom(socket, 'topicUpdate', topic);

            roomService.save(room).then(function () {
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

        var verdictObj = {
            user: user,
        }
        topicService.isCorrect(room.topic, answer).then(function (point) {
            verdictObj.point = point;
            return 1;
        }, function (point) {
            verdictObj.point = point;
            return 0;
        }).then(function (verdict) {
            verdictObj.verdict = verdict;
            nodifyVerdict(socket, room, verdictObj);
        })
    });
};

exports.checkTopic = checkTopic;

exports.nextTopic = nextTopic;

exports.register = function (socket) {
    var self = this;
    socket.on('complete next topic', function () {
        nextTopic(socket);
    });

    socket.on('complete check topic', function (answer) {
        checkTopic(socket, answer);
    });
};

exports.deregister = function (socket) {
};