"use strict";

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

var objSaved = function (room) {
    var _room = _.clone(room);

    _room.users = _.map(_room.users, function (user) {
        return _.isString(user) ? user : user.id;
    });

    if (!_.isString(_room.admin) && _room.admin.id) {
        _room.admin = _room.admin.id;
    }
    return _room;
};

var assemble = function (room) {

    if (room.readyUsers) {
        if (_.isString(room.readyUsers)) {
            room.readyUsers = room.readyUsers.split(',');
        }
    } else {
        room.readyUsers = [];
    }

    if (room.users && _.isString(room.users)) {
        room.users = room.users.split(',');
    }
    return userService.list(room.users).then(function (users) {
        room.users = users;
        room.admin = users[0];
        return room;
    })
};
exports.list = function (id) {
    return db.listObj("rooms", id).map(assemble);
};


exports.update = function (room, setFun) {

    var assembledRoom;
    return db.saveObj("rooms", room, function (lockedRoom) {
        return assemble(lockedRoom).then(function (assembledRoom) {
            setFun(assembledRoom);
            return objSaved(assembledRoom);
        })
    })
}
exports.save = function (room, userid) {

    room.create = moment().format();
    room.id = uuid.v1();
    room.admin = userid;
    room.status = 0;
    room.users = [userid];
    room.readyUsers = [];

    return db.saveObj("rooms", objSaved(room));

};

exports.remove = function (room) {
    return db.delete("rooms:" + room.id);
};
exports.listRoomStat = function (id) {
    return db.list("roomstats:" + id).then(function (state) {
        return JSON.parse(state);
    });
};
exports.updateRoomStat = function (room, verdictObj) {
    return this.listRoomStat(room.id).then(function (userstats) {
        if (userstats) {
            if (verdictObj.user) {
                var currentUserStat = _.find(userstats.users, "userid", verdictObj.user.id);
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
                    _.each(userstats.users, function (user) {
                        user.timeoutNum++;
                    });
                }
            }

            userstats.currNum++;

            return db.save("roomstats:" + room.id, JSON.stringify(userstats)).then(function () {
                return userstats;
            });
        } else {
            log.error("cannot found room statistics " + room.id);
        }
    });
};

exports.finishCompete = function (room, statist) {

    _.each(statist.users, function (user) {
        Statistic.create({
            correctNum: user.correctNum,
            incorrectNum: user.incorrectNum,
            timeoutNum: user.timeoutNum,
            point: user.point || 0,
            user: user.userid
        }, function (err) {
            if (err) {
                log.error("finish compete error ", err);
                return errorHandler(err);
            }
        })
    });

    db.delete("roomstats:" + room.id);


    return this.update(room, function(locked){
        locked.status = 0;
        locked.readyUsers = [];
        locked.topic = "";
    });
};
exports.terminateCompete = function (room) {

    return this.save(room, function (locked) {
        locked.readyUsers = [];
        locked.status = 0;
        locked.topic = "";
    }).then(function () {
        return db.delete("roomstats:" + room.id);
    })

};

exports.startCompete = function (room) {
    room.status = 1;
    return db.set("rooms:" + room.id, "status", room.status);
};

exports.removeCompeteState = function (room) {
    return db.delete("roomstats:" + room.id);
}
exports.createCompeteState = function (roomValue) {
    if (_.isString(_.first(roomValue.users))) {
        roomValue = assemble(roomValue);
    }
    return Promise.resolve(roomValue).then(function (room) {
        var roomstate = {
            users: _.map(room.users, function (user) {
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
