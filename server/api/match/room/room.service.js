"use strict";

var _ = require('lodash');
var db = require('../../redis/redis.service');
var userService = require('../../user/user.service');
var log = require('../../../log');
var RSVP = require('rsvp');

exports.list = function(id){

    return db.list("rooms", id).then(function (result) {
        var promises = [];
        var rooms = _.map(result, function (room) {
            promises.push(userService.list(room.admin).then(function(admin){
                room.admin = admin;
            }));

            room.users = room.users.split(',');
            promises.push(userService.list(room.users).then(function(users){
                room.users = users;
            }));
            return room;
        })
        return RSVP.all(promises).then(function(){
            return rooms;
        })

    })
}


exports.save = function(room){
    room.users = _.map(room.users, function(user){
        return _.isString(user)? user: user.id;
    })

    if(!_.isString(room.admin)){
        room.admin = room.admin.id;
    }

    return db.save("rooms", room);
}