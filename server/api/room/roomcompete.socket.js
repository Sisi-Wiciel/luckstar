var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');

var settings = require('../../config/setting');
var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var roomService = require('./room.service');
var socketService = require('../socket/socket.service');

module.exports = {
  events: {
    competeCheckTopic: checkTopic,
    competeGetTopic: getCompeteCurrentTopic
  },
  checkTopic: checkTopic,
  nextTopic: nextTopic,
  start: startCompete,
  deregister: function(socket) {

  }
};

function sendVerdict(socket, room, verdictObj) {
  log.verbose("compete.socket#NodifyVerdict", verdictObj);

  socketService.emitInAll(socket.room, 'topicVerdict', verdictObj);

  roomService.update(room, function(locked) {
    locked.topic = "";
  }).then(function() {
    roomService.updateRoomStat(room, verdictObj).then(function() {
      setTimeout(function() {
        nextTopic(socket);
      }, settings.ROOM.TOPICI_INTERVAL_TIME * 1000)
    })
  });

}

function topicTimeoutChecker(socket, topicId) {
  log.verbose("compete.socket#TopicTimeoutChecker", topicId);
  var topicSyncTimes = settings.ROOM.COMPETE_TOPIC_COUNTDOWN_SYNC;
  var topicCountdown = settings.ROOM.COMPETE_TOPIC_COUNTDOWN;

  _.each(topicSyncTimes, function(countdown, index) {
    setTimeout(function() {
      checkTopicStatus().then(function(room) {
        socketService.emitInAll(socket.room, 'topicCountDownUpdate', {value: countdown, max: topicCountdown});
      });
    }, (topicCountdown - countdown) * 1000)
  });

  setTimeout(function() {
    checkTopicStatus().then(function(room) {
      sendVerdict(socket, room, {
        verdict: -1
      });
    });
  }, topicCountdown * 1000);

  function checkTopicStatus() {
    return new Promise(function(resolve) {
      if (!_.isEmpty(socket.room)) {
        roomService.list(socket.room).then(function(room) {
          if (room && room.status == 1 && topicId === room.topicid) {
            resolve(room);
          }
        });
      }
    });
  }
}

function nextTopic(socket) {
  log.verbose("compete.socket#NextTopic");
  var roomSocket = require('./room.socket');

  roomService.list(socket.room).then(function(room) {
    if (room) {
      roomService.nextRoomTopic(room.id).then(function(topic) {
        if (_.isEmpty(topic)) {
          roomService.finishCompete(room).then(function() {
            roomSocket.updateRooms(socket);
          });
        } else {
          topic.index = room.topicindex;
          socketService.emitInAll(socket.room, 'topicUpdate', topic);
          topicTimeoutChecker(socket, topic.id);
        }
      });
    }
  });

}

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
      topicService.isCorrect(room.topicid, answer).then(function(verdictObj) {
        verdictObj.user = user;
        verdictObj.opt = answer;
        sendVerdict.call(self, socket, room, verdictObj);
      });
    } else {
      log.warn("User as observer can't checkout topic ", socket.uid);
    }

  });
}

function getCompeteCurrentTopic(socket) {
  log.verbose('compete.socket#getCompeteCurrentTopic');

  roomService.list(socket.room).then(function(room) {
    if (room && room.topicid) {
      topicService.getTopic(room.topicid).then(function(topic) {
        socket.emit('topicUpdate', topic);
      });
    } else {
      log.debug("No current topic in this competition", socket.room);
    }
  });
}

function startCompete(socket, room) {
  var self = this;
  roomService.createCompeteState(room).then(function() {
    (function startCountDown(number) {

      setTimeout(function() {
        if (number > 0) {
          socketService.emitInAll(socket.room, 'StartCompeteCountDown', number);
          startCountDown(--number);
        } else {
          self.nextTopic(socket);
        }
      }, settings.ROOM.COMPETE_COUNTDOWN_INTERVAL * 1000);
    })(settings.ROOM.COMPETE_COUNTDOWN_TIMES);
  });
}
