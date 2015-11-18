"use strict";
var db = require('../redis/redis.service');

var Promise = require('bluebird');
var _ = require('lodash');
var log = require('../../log');

exports.changeStatus = function (id, status) {
    log.info("ChangeUserStatus", id, status);
    if (id) {
        return db.set("users:" + id, "status", status);
    } else {
        log.error("changeStatus: invalid id", id, status);
    }
};

exports.add = function (user) {
    log.info("AddUser", user._id.toString());

    if (user._id) {
        return db.saveObj("users", {
            avatar: user.avatar,
            point: user.point,
            id: user._id.toString(),
            status: 0,
            username: user.username,
            sid: ''
        })
    } else {
        log.error("addUser: invalid id", user);
    }

};

exports.joinRoom = function (user, room) {
    return db.set("users:" + user.id, "room", room.id);
};

exports.updatePoint = function (uid, point) {

    this.list(uid).then(function (users) {
        var user = _.first(users);
        db.set("users:" + uid, "point", parseInt(user.point) + parseInt(point));
    });
}


exports.list = function (ids) {

    if (ids === undefined) {
        return db.listObj("users", ids);
    } else if (_.isString(ids) && ids !== "") {
        return db.listObj("users", ids);
    } else if (_.isArray(ids)) {
        return Promise.all(_.map(ids, function (id) {
            return db.listObj("users", id)
        })).then(_.flatten);
    } else {
        return Promise.resolve();
    }

};