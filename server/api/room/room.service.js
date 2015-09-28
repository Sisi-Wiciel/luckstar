"use strict";

var _ = require('lodash');
var db = require('../redis/redis.service.js');
var userService = require('../user/user.service.js');
var log = require('../../log');
var RSVP = require('rsvp');

exports.list = function (id) {

    return db.list("rooms", id).then(function (result) {
        var promises = [];
        var rooms = _.map(result, function (room) {
            promises.push(userService.list(room.admin).then(function (admin) {
                room.admin = _.first(admin);
            }));

            if (room.users) {
                room.users = room.users.split(',');
            }

            if (room.readyUsers) {
                room.readyUsers = room.readyUsers.split(',');
            }

            promises.push(userService.list(room.users).then(function (users) {
                room.users = users;
            }));
            return room;
        })
        return RSVP.all(promises).then(function () {
            return rooms;
        })

    })
}


exports.save = function (room) {
    var _room = _.clone(room);
    _room.users = _.map(_room.users, function (user) {
        return _.isString(user) ? user : user.id;
    });

    if (!_.isString(_room.admin) && _room.admin.id) {
        _room.admin = _room.admin.id;
    }

    return db.save("rooms", _room);
}

exports.remove = function (room) {
    return db.delete("rooms", room);
}