'use strict';
var db = require('../redis/redis.service');

var Promise = require('bluebird');
var _ = require('lodash');
var log = require('../../log');
var setting = require('../../config/setting');

var update = function(id, setFunc) {
  return db.saveObj("users", id, function(lockedUser) {
    setFunc(lockedUser);
    return lockedUser;
  });
};

exports.disconnect = function(id) {
  return db.set("users:" + id, "sid", '');
};

exports.online = function(id) {
  log.debug("user.service#UserOnline", id);
  return db.set("users:" + id, "state", 1);
};

exports.changeStatus = function(id, status) {
  log.debug("user.service#ChangeStatus", id, status);
  return db.set("users:" + id, "status", status);
};

exports.offline = function(id) {
  log.debug("user.service#UserOffline", id);
  return this.setRoom(id, null)
  .then(function() {
    return db.set("users:" + id, "state", 0)
  })
  .then(function() {
    this.changeStatus(id, setting.USER.STATUS.OFFLINE);
  }.bind(this));
};

exports.isOnline = function(id) {
  return this.list(id).then(function(user) {
    if(user){
      return 1 === parseInt(user.state, 10);
    }else{
      return false;
    }
  });
};

exports.add = function(user) {
  log.debug("user.service#AddUser", user.id);

  if (user.id) {
    return db.saveObj("users", {
      avatar: user.avatar,
      point: user.point,
      id: user.id,
      status: setting.USER.STATUS.OFFLINE,
      state: 0,
      username: user.username,
      sid: ''
    })
  } else {
    log.error("addUser: invalid id", user);
  }

};

exports.setRoom = function(userid, roomid) {
  log.debug("user.service#JoinRoom", userid, roomid);
  return db.set("users:" + userid, "room", roomid);
};

exports.updatePoint = function(uid, point) {
  log.debug("user.service#UpdatePoint", uid, point);
  return this.list(uid).then(function(user) {
    return update(user.id, function(lockedUser) {
      lockedUser.point = parseInt(user.point) + parseInt(point);
    });
  });
};

exports.list = function(ids) {
  return db.listObj("users", ids);
};
