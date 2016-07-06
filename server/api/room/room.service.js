'use strict';

var _ = require('lodash');
var log = require('../../log');
var Promise = require('bluebird');
var moment = require('moment');
var Statistic = require('./statistic.model');
var settings = require('../../config/setting');
var uuid = require('node-uuid');

var redisService = require('../redis/redis.service.js');
var userService = require('../user/user.service.js');
var topicService = require('../topic/topic.service');

var REIDS_ROOM_KEY = 'rooms';
var REIDS_ROOMTOPIC_KEY = 'roomtopics';
var REIDS_ROOMSTATS_KEY = 'roomstats';

module.exports = {
  createCompeteState: createCompeteState,
  removeCompeteState: removeCompeteState,
  startCompete: startCompete,
  terminateCompete: terminateCompete,
  list: listRoom,
  update: updateRoom,
  save: saveRoom,
  remove: removeRoom,
  listRoomStat: listRoomStat,
  updateRoomStat: updateRoomStat,
  finishCompete: finishCompete,
  join: joinRoom,
  leave: leaveRoom,
  nextRoomTopic: nextRoomTopic
};

//obj => redis
function objSaved(room) {
  var _room = _.clone(room);

  _room.users = _.map(_room.users, function(user) {
    return _.isString(user) ? user : user.id;
  });

  _room.obs = _.map(_room.obs, function(user) {
    return _.isString(user) ? user : user.id;
  });

  if (!_.isString(_room.admin) && _room.admin.id) {
    _room.admin = _room.admin.id;
  }
  return _room;
}

//redis => obj
function assemble(room) {

  if (_.isEmpty(room)) {
    return room;
  }

  var parseArrIds = function(key) {
    if (room.hasOwnProperty(key) && !_.isEmpty(room[key])) {
      if (_.isString(room[key])) {
        room[key] = room[key].split(',');
      }
    } else {
      room[key] = [];
    }
  };

  room.status = ~~room.status;
  room.number = ~~room.number;
  room.mode = ~~room.mode;
  room.topicindex = ~~room.topicindex || 0;

  parseArrIds("readyUsers");
  parseArrIds("obs");

  if (room.users && _.isString(room.users)) {
    room.users = room.users.split(',');
  }

  return userService.list(room.users).then(function(users) {
    room.users = users;
    room.admin = users[0];
    return room;
  })
}

function nextRoomTopic(roomid) {
  return this.list(roomid).then(function(room) {
    return redisService.list(REIDS_ROOMTOPIC_KEY + ':' + room.id).then(function(topics) {
      var topicindex = ~~(room.topicindex);
      var topicArray = JSON.parse(topics);
      if (topicindex >= topicArray.length) {
        return null;
      } else {
        var topic = topicArray[topicindex];
        return updateRoomTopics(room.id, topicArray).then(function() {
          return updateRoom(room.id, function(locked) {
            locked.topicindex ++;
            locked.topicid = topic.id;
          });
        }).return(topic);
      }
    });
  })
}

function leaveRoom(room, user) {
  log.verbose("room.service#Leave", room, user);
  var self = this, promise;

  function adminPolicy(room) {
    return self.remove(room);
  }

  function playerPolicy(room, user) {
    return self.update(room, function(locked) {
      _.remove(locked.users, {'id': user.id});
      _.pull(locked.readyUsers, user.id);
    });
  }

  function obPolicy(room, user) {
    return self.update(room, function(locked) {
      _.pull(locked.obs, user.id);
    });
  }

  if (!_.isEmpty(room) && !_.isEmpty(user)) {

    if (user.id === room.admin.id) {
      promise = adminPolicy(room, user);
    } else if (_.find(room.users, {"id": user.id})) {
      promise = playerPolicy(room, user);
    } else if (room.obs.indexOf(user.id) >= 0) {
      promise = obPolicy(room, user);
    } else {
      log.warn("User was not joined the room");
    }
  }
  if (_.isEmpty(promise)) {
    return null;
  }

  return promise.then(function() {
    return userService.setRoom(user.id, '');
  });
}

function listRoom(id) {
  return redisService.listObj(REIDS_ROOM_KEY, id).then(function(rooms) {
    if (_.isArray(rooms)) {
      return Promise.map(rooms, assemble);
    }
    return assemble(rooms);
  });
  //return Promise.map(ret, assemble);
  //if(id === undefined){
  //  return redisService.listObj("rooms").map(assemble);
  //}else if(_.isEmpty(id)){
  //  return Promise.resolve(null);
  //}else if(_.isA){
  //  return redisService.listObj("rooms", id).map(assemble);
  //}
}

function updateRoom(room, setFun) {
  room = _.isString(room) ? {id: room} : room;

  return redisService.saveOrUpdateObj(REIDS_ROOM_KEY, room, function(lockedRoom) {
    return assemble(lockedRoom).then(function(assembledRoom) {
      setFun(assembledRoom);
      room = assembledRoom;
      return objSaved(assembledRoom);
    }, function(error) {
      log.error("update room error", error);
    });
  }, function(error) {
    log.error("save room error", error);
  }).then(function() {
    return room;
  })
}

function saveRoom(room, userid) {
  room.create = moment().format();
  room.observable = room.observable || 1;
  room.id = uuid.v1();
  room.admin = userid;
  room.status = 0;
  room.users = [userid];
  room.readyUsers = [userid];
  room.obs = [];
  room.number = room.number || 5;
  room.mode = 0;
  return redisService.saveOrUpdateObj(REIDS_ROOM_KEY, objSaved(room));
}

function removeRoom(room) {
  return this.removeCompeteState(room).then(function() {
    return redisService.delete(REIDS_ROOM_KEY +':'+ room.id);
  })
}

function listRoomStat(id) {
  return redisService.list(REIDS_ROOMSTATS_KEY + ":" + id).then(function(state) {
    return JSON.parse(state);
  });
}

function updateRoomStat(room, verdictObj) {
  return this.listRoomStat(room.id).then(function(userstats) {
    if (userstats) {
      if (verdictObj.user) {
        var currentUserStat = _.find(userstats.users, {"userid": verdictObj.user.id});
        switch (verdictObj.verdict) {
          case 1:
            currentUserStat.point += verdictObj.point;
            currentUserStat.correctNum++;
            break;
          case 0:
            currentUserStat.point -= verdictObj.point;
            if (currentUserStat.point < 0) {
              currentUserStat.point = 0;
            }
            currentUserStat.incorrectNum++;
            break;
        }
      } else {
        if (verdictObj.verdict == -1) {
          _.each(userstats.users, function(user) {
            user.timeoutNum++;
          });
        }
      }

      userstats.currNum++;

      return redisService.save(REIDS_ROOMSTATS_KEY + ":" + room.id, JSON.stringify(userstats)).then(function() {
        return userstats;
      });
    } else {
      log.error("cannot found room statistics " + room.id);
    }
  });
}

function finishCompete(room) {
  var self = this;
  return this.listRoomStat(room.id).then(function(statist) {

    redisService.delete(REIDS_ROOMTOPIC_KEY + ":" + room.id);

    if (statist) {
      return Promise.map(statist.users, function(user) {
        Statistic.create({
          correctNum: user.correctNum,
          incorrectNum: user.incorrectNum,
          timeoutNum: user.timeoutNum,
          point: user.point || 0,
          user: user.userid
        }, function(err) {
          if (err) {
            log.error("Save statistic error ", err);
          }
        });
        return userService.updatePoint(user.userid, user.point);
      }).then(function() {
        return self.update(room, function(locked) {
          locked.status = 0;
          locked.readyUsers = [locked.admin.id];
          locked.topicid = '';
        });
      })

    }
  });

}


function joinRoom(room, user, isPlayer) {
  isPlayer = isPlayer === undefined || isPlayer;
  log.verbose("room.service#Join", room, user, isPlayer);

  //Firstly check if user in room already.
  return Promise.resolve(this.leave(room, user)).then(function() {
    return this.update(room, function(locked) {
      if (isPlayer && locked.users.length < locked.number) {
        if (!_.find(locked.users, {'id': user.id})) {
          locked.users.push(user);
        }
      } else {
        if (locked.obs.indexOf(user.id) == -1) {
          locked.obs.push(user);
        }
      }
    });
  }.bind(this));
}

function terminateCompete(room) {
  return this.finishCompete(room);
}

function updateRoomTopics(roomid, topics) {
  return redisService.save(REIDS_ROOMTOPIC_KEY + ':' + roomid, JSON.stringify(topics));
}

function startCompete(room) {
  var self = this;
  return topicService.fetchTopic(settings.ROOM.COMPETE_MAX_TOPICS)
  .then(function(topics) {
    return updateRoomTopics(room.id, topics);
  }).then(function() {
    return self.update(room, function(lockroom) {
      lockroom.status = 1;
      lockroom.topicindex = 0;
    });
  });
}

function removeCompeteState(room) {
  return redisService.delete(REIDS_ROOMSTATS_KEY + ":" + room.id);
}

function createCompeteState(roomValue) {
  if (_.isString(_.first(roomValue.users))) {
    roomValue = assemble(roomValue);
  }

  return Promise.resolve(roomValue).then(function(room) {
    var roomstate = {
      id: uuid.v1(),
      users: _.map(room.users, function(user) {
        return {
          userid: user.id,
          username: user.username,
          correctNum: 0,
          incorrectNum: 0,
          timeoutNum: 0,
          point: 0
        };
      }),
      maxNum: settings.ROOM.COMPETE_MAX_TOPICS,
      currNum: 0,
      start: moment()
    };

    redisService.save(REIDS_ROOMSTATS_KEY + ":" + room.id, JSON.stringify(roomstate));
    return roomstate;
  })
}

