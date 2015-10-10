"use strict";

var _ = require('lodash');
var db = require('../redis/redis.service.js');
var userService = require('../user/user.service.js');
var log = require('../../log');
var Promise = require('bluebird');

var assemble = function(room){
    console.info("assemble");
    if (room.readyUsers) {
        room.readyUsers = room.readyUsers.split(',');
    }else{
        room.readyUsers = [];
    }

    return userService.list(room.users.split(',')).then(function (users) {
        room.users = users;
        room.admin = users[0];
        return room;
    })
}
exports.list = function (id) {
    return db.list("rooms", id).map(assemble);
}

exports.save = function (room, setFun) {

    var objSaved = function(room){
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
    if(setFun && _.isFunction(setFun)){
        promise = db.save("rooms", room, function (lockedRoom) {
                return assemble(lockedRoom).then(function(assembledRoom){
                    setFun(assembledRoom);
                    return objSaved(assembledRoom);
                })
            })
    }else{
        promise = db.save("rooms", objSaved(room));
    }

    return promise;

}

exports.remove = function (room) {
    return db.delete("rooms", room);
}