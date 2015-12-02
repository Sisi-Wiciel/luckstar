"use strict";
var db = require('../redis/redis.service');

var Promise = require('bluebird');
var _ = require('lodash');
var log = require('../../log');
var setting = require('../../config/setting');

exports.online = function (id) {
    log.info("UserOnline", id);
    if (id) {
        return db.set("users:" + id, "state", 1);
    } else {
        log.error("changeState: invalid id", id, state);
    }

};

exports.changeStatus = function(id, status){
    log.info("ChangeStatus", id, status);
    return db.set("users:" + id, "status", status);
}
exports.offline = function (id) {
    log.info("UserOffline", id);
    if (id) {
        return db.set("users:" + id, "state", 0).then(function(){
            this.changeStatus(id, setting.USER.STATUS.OFFLINE);
        }.bind(this));
    } else {
        log.error("changeState: invalid id", id);
    }

};

exports.add = function (user) {
    log.info("AddUser", user._id.toString());

    if (user._id) {
        return db.saveObj("users", {
            avatar: user.avatar,
            point: user.point,
            id: user._id.toString(),
            status: setting.USER.STATUS.OFFLINE,
            state: 0,
            username: user.username,
            sid: ''
        })
    } else {
        log.error("addUser: invalid id", user);
    }

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