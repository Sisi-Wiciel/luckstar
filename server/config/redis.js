var redis = require('redis');
var _ = require('lodash');
var Topic = require('../api/topic/topic.model');
var User = require('../api/user/user.model');

var client = redis.createClient();

var loadTopic = function () {

  Topic.find(function (err, topics) {
    if (err) {
      console.error(err);
    }
    _.each(topics, function (topic) {
      client.SADD("topics", JSON.stringify(topic));
    });
  });
};

var loadUser = function () {
  User.find(function (err, users) {
    if (err) {
      console.error(err);
    }

    _.each(users, function (user) {
      client.HMSET("users:" + user._id, {
        id: user._id,
        status: 0,
        username: user.username,
      });
    });
  })
};

var clean = function () {
  client.keys('*', function (err, keys) {
    if (err) return console.log(err);

    for (var i = 0, len = keys.length; i < len; i++) {
      client.del(keys[i]);
    }
  });
}
exports.init = function () {
  client.on('ready', function () {
    clean();
    loadTopic();
    loadUser();
  });
};

exports.randomTopics = function (number, cb) {
  var _cb = cb || _.noop;

  client.srandmember("topics", number, function (err, objs) {
    if (err) {
      console.info(err);
    } else {
      _cb(objs);
    }
  });
};

exports.addTopic = function (topic) {
  client.SADD("topics", JSON.stringify(topic));
}

exports.online = function (id, cb) {
  var _cb = cb || _.noop;
  client.hset("users:" + id, "status", 1, _cb);
};

exports.getUsersWithStatus = function (cb) {
  client.keys('users*', function (err, keys) {
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
}