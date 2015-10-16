"use strict";

var _ = require('lodash');
var db = require('../redis/redis.service.js');
var userService = require('../user/user.service.js');
var log = require('../../log');
var Promise = require('bluebird');
var moment = require('moment');
var Statistic = require('./statistic.model');
var errorHandler = require('express-error-handler');

var assemble = function (room) {

    if (room.readyUsers) {
        if(_.isString(room.readyUsers)){
            room.readyUsers = room.readyUsers.split(',');
        }
    } else {
        room.readyUsers = [];
    }

    if(room.users && _.isString(room.users)){
        room.users = room.users.split(',');
    }
    return userService.list(room.users).then(function (users) {
        room.users = users;
        room.admin = users[0];
        return room;
    })
}
exports.list = function (id) {
    return db.listObj("rooms", id).map(assemble);
}

exports.save = function (room, setFun) {

    var objSaved = function (room) {
        var _room = _.clone(room);

        _room.users = _.map(_room.users, function (user) {
            return _.isString(user) ? user : user.id;
        });

        if (!_.isString(_room.admin) && _room.admin.id) {
            _room.admin = _room.admin.id;
        }
        return _room;
    }

    var promise;
    if (setFun && _.isFunction(setFun)) {
        var assembledRoom;
        promise = db.saveObj("rooms", room, function (lockedRoom) {
            return assemble(lockedRoom).then(function (assembledRoom) {
                setFun(assembledRoom);
                return objSaved(assembledRoom);
            })
        })
    } else {
        promise = db.saveObj("rooms", objSaved(room));
    }

    return promise;

}

exports.remove = function (room) {
    return db.delete("rooms:" + room.id);
}
exports.listRoomStat = function(id){
    return db.list("roomstats:"+id);
}
exports.updateRoomStat = function (room, verdictObj) {
    return this.listRoomStat(room.id).then(function(state){
        if(state){
            var userstats = JSON.parse(state);
            if(verdictObj.user){
                var currentUserStat = _.find(userstats.users, "userid", verdictObj.user.id);
                switch (verdictObj.verdict){
                    case 1:
                        currentUserStat.point += verdictObj.point;
                        currentUserStat.correctNum ++;
                        break;
                    case 0:
                        currentUserStat.point -= verdictObj.point;
                        if(currentUserStat.point < 0){
                            currentUserStat.point = 0;
                        }
                        currentUserStat.incorrectNum ++;
                        break;
                }
            }else{
                if(verdictObj.verdict == -1){
                    _.each(userstats.users, function(user){
                        user.timeoutNum ++;
                    });
                }
            }

            userstats.currNum ++;

            return db.save("roomstats:"+room.id, JSON.stringify(userstats)).then(function(){
                return userstats;
            });
        }else{
            console.error("cannot found room statistics " + room.id);
        }
    });
};

exports.finishCompete= function (room, statist) {

    _.each(statist.users, function(user){
        Statistic.create({
            correctNum: user.correctNum,
            incorrectNum: user.incorrectNum,
            timeoutNum: user.timeoutNum,
            point: user.point,
            user: user.userid
        }, function (err) {
            if (err) {
                return errorHandler(res, err);
            }
        })
    })

    db.delete("roomstats:" + room.id);

    room.status = 0;
    room.readyUsers = [];
    room.topic = "";
    return this.save(room);
}
exports.startCompete= function (room) {
    room.status = 1;
    return db.set("rooms:" + room.id, "status", room.status);
}
exports.createRoomStateList = function (roomValue) {
    if(_.isString(_.first(roomValue.users))){
        roomValue = assemble(roomValue);
    }
    return Promise.resolve(roomValue).then(function(room){
        var roomstate = {
            users: [],
            maxNum: 10,
            currNum: 1,
            start: moment()
        }
        roomstate.users = _.map(room.users, function (user) {
            var _state = {
                userid: user.id,
                username: user.username,
                correctNum: 0,
                incorrectNum: 0,
                timeoutNum: 0,
                point:0
            }
            return _state;
        });

        db.save("roomstats:"+room.id,  JSON.stringify(roomstate));
        return roomstate;
    })

};
