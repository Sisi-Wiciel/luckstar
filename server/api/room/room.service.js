'use strict';

var _ = require('lodash');
var db = require('../redis/redis.service.js');
var userService = require('../user/user.service.js');
var log = require('../../log');
var Promise = require('bluebird');
var moment = require('moment');
var Statistic = require('./statistic.model');
var errorHandler = require('express-error-handler');
var settings = require('../../config/setting');
var uuid = require('node-uuid');

//obj => redis
var objSaved = function(room) {
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
};

//redis => obj
var assemble = function(room) {

  if (!room) {
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
  }

  room.status = parseInt(room.status);
  room.number = parseInt(room.number);
  room.mode = parseInt(room.mode);

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
};
exports.list = function(id) {
  return db.listObj("rooms", id).map(assemble);
};

exports.update = function(room, setFun) {
  room = _.isString(room) ? {id: room} : room;
  return db.saveObj("rooms", room, function(lockedRoom) {
    return assemble(lockedRoom).then(function(assembledRoom) {
      setFun(assembledRoom);
      return objSaved(assembledRoom);
    }, function(error) {
      log.error("update room error", error);
    })
  }, function(error) {
    log.error("save room error", error);
  })
};

exports.save = function(room, userid) {

  room.create = moment().format();
  room.id = uuid.v1();
  room.admin = userid;
  room.status = 0;
  room.users = [userid];
  room.readyUsers = [userid];
  room.obs = [];
  room.number = 5;
  return db.saveObj("rooms", objSaved(room));
};

exports.remove = function(room) {
  return this.removeCompeteState(room).then(function() {
    return db.delete("rooms:" + room.id);
  })
};
exports.listRoomStat = function(id) {
  return db.list("roomstats:" + id).then(function(state) {
    return JSON.parse(state);
  });
};
exports.updateRoomStat = function(room, verdictObj) {
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

      return db.save("roomstats:" + room.id, JSON.stringify(userstats)).then(function() {
        return userstats;
      });
    } else {
      log.error("cannot found room statistics " + room.id);
    }
  });
};

exports.finishCompete = function(room, statist) {

  if (statist) {
    _.each(statist.users, function(user) {
      Statistic.create({
        correctNum: user.correctNum,
        incorrectNum: user.incorrectNum,
        timeoutNum: user.timeoutNum,
        point: user.point || 0,
        user: user.userid
      }, function(err) {
        if (err) {
          log.error("finish compete error ", err);
          return errorHandler(err);
        }
      })
    });
  }

  return this.update(room, function(locked) {
    locked.status = 0;
    locked.readyUsers = [locked.admin.id];
    locked.topic = '';
  });
};

exports.leave = function(room, user) {
  var self = this, promise;

  function adminPolicy(room, user) {
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
      log.error("Unknown role of user");
    }
  }
  if (_.isEmpty(promise)) {
    return null;
  }

  return promise.then(function() {
    return userService.setRoom(user.id, '');
  });

};

exports.join = function(room, user) {
  return this.update(room, function(locked) {
    if (locked.users.length < locked.number) {
      if (!_.find(locked.users, {'id': user.id})) {
        locked.users.push(user);
      }
    } else {
      if (locked.obs.indexOf(user.id) == -1) {
        locked.obs.push(user);
      }
    }
  });
};

exports.terminateCompete = function(room) {
  return this.finishCompete(room);
};

exports.startCompete = function(room) {
  room.status = 1;
  return db.set("rooms:" + room.id, "status", room.status);
};

exports.removeCompeteState = function(room) {
  return db.delete("roomstats:" + room.id);
}
exports.createCompeteState = function(roomValue) {
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

    db.save("roomstats:" + room.id, JSON.stringify(roomstate));
    return roomstate;
  })
};
