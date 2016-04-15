var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var roomService = require('./room.service');
var roomSocket = require('./room.socket');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var settings = require('../../config/setting');

var nodifyRoom = function(socket, key, obj) {
  socket.io.sockets.in(socket.room).emit(key, obj);
};

var nodifyVerdict = function(socket, room, verdictObj) {
  log.verbose("compete.socket#NodifyVerdict", verdictObj);

  nodifyRoom(socket, 'topicVerdict', verdictObj);

  roomService.update(room, function(locked) {
    locked.topic = null;
  }).then(function() {
    roomService.updateRoomStat(room, verdictObj).then(function(competeStat) {
      if (verdictObj.verdict == 0) {
        roomSocket.sendRoomMessage(socket, "第" + competeStat.currNum + "题: 用户" + verdictObj.user.username + "回答错误", true);
      } else if (verdictObj.verdict == 1) {
        roomSocket.sendRoomMessage(socket, "第" + competeStat.currNum + "题: 用户" + verdictObj.user.username + "回答正确", true);
      } else if (verdictObj.verdict == -1) {
        roomSocket.sendRoomMessage(socket, "第" + competeStat.currNum + "题: 答题超时", true);
      }

      setTimeout(function() {
        if (competeStat.currNum >= competeStat.maxNum) {
          roomService.finishCompete(room, competeStat).then(function() {

            Promise.map(competeStat.users, function(user) {
              return userService.updatePoint(user.userid, user.point);
            }).then(function() {
              roomSocket.updateRooms(socket);
            });

          });
        } else {
          nextTopic(socket);
        }
      }, 2000);

    });
  })

};

var topicTimeoutChecker = function(socket, topicId) {
  log.verbose("compete.socket#TopicTimeoutChecker", topicId);

  setTimeout(function() {
    if (socket.room) {
      roomService.list(socket.room).then(function(room) {
        if (room && room.status == 1 && topicId === room.topic) {
          nodifyVerdict(socket, room, {
            verdict: -1
          });
        }
      });
    }
  }, settings.ROOM.COMPETE_TOPIC_COUNTDOWN * 1000);
};

function nextTopic(socket) {
  log.verbose("compete.socket#NextTopic");
  var self = this;
  roomService.list(socket.room).then(function(room) {
    if (room) {
      topicService.get().then(function(topic) {
        delete topic.correct;

        nodifyRoom(socket, 'topicUpdate', topic);

        roomService.update(room, function(locked) {
          locked.topic = topic._id;
        }).then(function() {
          topicTimeoutChecker(socket, topic._id);
        });

      });
    }

  });
};

function checkTopic(socket, answer) {
  log.verbose("compete.socket#CheckTopic");
  var self = this;

  Promise.props({
    'user': userService.list(socket.uid),
    'room': roomService.list(socket.room)
  }).then(function(results) {
    var user = results.user;
    var room = results.room;

    if (_.find(room.users, {"id": socket.uid})) {
      topicService.isCorrect(room.topic, answer).then(function(verdictObj) {
        verdictObj.user = user;
        verdictObj.opt = answer;
        nodifyVerdict(socket, room, verdictObj);
      });
    } else {
      log.warn("User as observer can't able to answer topic ", socket.uid);
    }

  });
};

var getTopic = function(socket) {
  roomService.list(socket.room).then(function(room) {
    if (room && room.topic) {
      topicService.get(room.topic).then(function(topic) {
        socket.emit('topicUpdate', topic);
      });
    } else {
      log.debug("no current topic in this competition");
    }

  })
}

exports.checkTopic = checkTopic;

exports.nextTopic = nextTopic;

exports.register = function(socket) {
  var ss = require('../socket/socket.service');
  ss.on(socket, 'complete get topic', function() {
    getTopic(socket);
  });

  ss.on(socket, 'complete check topic', function(answer) {
    checkTopic(socket, answer);
  });
};

exports.deregister = function(socket) {
};
