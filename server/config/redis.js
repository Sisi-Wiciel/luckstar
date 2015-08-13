var redis = require('redis');
var _ = require('lodash');
var Topic = require('../api/topic/topic.model');
var User = require('../api/user/user.model');

var client = redis.createClient();

var CHAT_ID = "CHATID";

var clean = function () {
  client.keys('*', function (err, keys) {
    if (err) return console.log(err);

    for (var i = 0, len = keys.length; i < len; i++) {
      client.del(keys[i]);
    }
  });
}
module.exports = {
  init: function () {
    var self = this;
    client.on('ready', function () {
      clean();

      Topic.find(function (err, topics) {
        if (err) {
          console.error(err);
        }
        _.each(topics, function (topic) {
          client.SADD("topics", JSON.stringify(topic));
        });
      });

      User.find(function (err, users) {
        if (err) {
          console.error(err);
        }

        _.each(users, function (user) {
          self.addUser(user);
        });
      });

      client.set(CHAT_ID, 0);

    });
  },
  randomTopics: function (number, cb) {
    var _cb = cb || _.noop;

    client.srandmember("topics", number, function (err, objs) {
      if (err) {
        console.info(err);
      } else {
        _cb(objs);
      }
    });
  },
  addTopic: function (topic) {
    client.SADD("topics", JSON.stringify(topic));
  },
  changeUserStatus: function (id, status, cb) {
    if(id){
      var _cb = cb || _.noop;
      client.hset("users:" + id, "status", status, _cb);
    }else{
      console.error("changeUserStatus: invalid id", id, status, cb);
    }
  },
  setUserSid: function(uid, sid){
    if(uid && sid){
      client.hset("users:" + uid, "sid", sid);
    }
  },
  addUser: function (user) {
    if(user._id){
      client.HMSET("users:" + user._id, {
        id: user._id,
        status: 0,
        username: user.username,
        sid: ''
      });
    }else{
      console.error("addUser: invalid id", user);
    }

  },
  getUsersWithStatus: function (id, cb) {
    var _id = id || '*';
    client.keys('users:'+_id, function (err, keys) {
      if (err) return console.log(err);
      var users = [];
      _.each(keys, function (key, index) {
        client.hgetall(key, function (err, user) {
          users.push(user);
          if (index == keys.length - 1) {
            cb(users);
          }
        })
      })
    });
  },
  getChatId: function(cb){
    client.incr(CHAT_ID, function(err, id){
      cb(id);
    });
  }
}

