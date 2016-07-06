'use strict';
var redisDbService = require('../redis/redis.service');
var User = require("./user.model");
var log = require('../../log');
var setting = require('../../config/setting');

module.exports = {
  isUniqueName: isUniqueName,
  disconnect: disconnect,
  online: online,
  changeStatus: changeStatus,
  offline: offline,
  isOnline: isOnline,
  add: addUser,
  setRoom: setRoom,
  updatePoint: updatePoint,
  list: listUser
};

function isUniqueName(username) {
  return User.findOne({username: username}).exec().then(function(user) {
    return user == null;
  });
}

function disconnect(id) {
  return redisDbService.set("users:" + id, "sid", '');
}

function online(id) {
  log.debug("user.service#UserOnline", id);
  return redisDbService.set("users:" + id, "state", 1);
}

function changeStatus(id, status) {
  log.debug("user.service#ChangeStatus", id, status);
  return redisDbService.set("users:" + id, "status", status);
}

function offline(id) {
  log.debug("user.service#UserOffline", id);
  return this.setRoom(id, null)
  .then(function() {
    return redisDbService.set("users:" + id, "state", 0)
  })
  .then(function() {
    this.changeStatus(id, setting.USER.STATUS.OFFLINE);
  }.bind(this));
}

function isOnline(id) {
  return this.list(id).then(function(user) {
    if(user){
      return 1 === parseInt(user.state, 10);
    }else{
      return false;
    }
  });
}

function addUser(user) {
  log.debug("user.service#AddUser", user.id);

  if (user.id) {
    return redisDbService.saveOrUpdateObj("users", {
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
}

function setRoom(userid, roomid) {
  log.debug("user.service#setRoom", userid, roomid);
  return redisDbService.set("users:" + userid, "room", roomid);
}

function updatePoint(uid, point) {
  log.debug("user.service#UpdatePoint", uid, point);
  return this.list(uid).then(function(user) {
    return redisDbService.saveOrUpdateObj("users", user.id, function(lockedUser) {
      lockedUser.point = parseInt(user.point) + parseInt(point);
    });
  });
}

function listUser(ids) {
  return redisDbService.listObj("users", ids);
}
