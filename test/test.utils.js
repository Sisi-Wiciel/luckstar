var mongoose = require("mongoose");
var _ = require('lodash');
var faker = require('faker');
var Promise = require('bluebird');
var redis = require('then-redis');
var sinon = require('sinon');

var settings = require('../server/config/setting');

var redisService = require('../server/api/redis/redis.service');
var topicService = require('../server/api/topic/topic.service');
var userService = require('../server/api/user/user.service');
var roomService = require('../server/api/room/room.service');
var User = require('../server/api/user/user.model');

faker.locale = 'zh_CN';

mongoose.connect('mongodb://localhost/luckstar');

beforeEach(function() {
  var self = this;
  return initDB().then(function(newUsers) {
    self.users = newUsers;
  });
});

afterEach(function() {
  return cleanDB.call(this);
});

module.exports = {
  init: initDB,
  clean: cleanDB,
  resolve: function(expectedResponse) {
    return {
      then: function(callback) {
        callback(expectedResponse);
      }
    }
  },
  newSocket: function(userid) {
    function Socket(userid) {
      this.uid = userid;
      this.emit = sinon.spy();
      this.join = sinon.spy();
      this.close = sinon.spy();
    }
    return new Socket(userid);
  },
  newRoom: function(params) {
    return this.newUsers().get(0).then(function(user) {
      return roomService.save({
        title: faker.name.title(),
        number: ~~(Math.random() * 10 + 1)
      }, user.id).then(function(room) {
        if(_.isEmpty(params)){
          return roomService.list(room.id);
        }else{
          return roomService.update(room, function(lockedRoom) {
            _.assign(lockedRoom, params);
          });
        }
      });
    });
  },
  newDBTopic: function(number) {
    var topics = _.times(number || 1, function() {
      return {
        title: faker.random.words(),
        options: [2],
        active: true,
        point: 10,
        creator: new Date(),
        corrector: [1]
      }
    });

    return Promise.map(topics, function(topic) {
      return topicService.saveTopic(topic);
    });
  },
  newDBUsers: newDBUsers,
  newUsers: newUsers
};

function newUsers(number) {
  return this.newDBUsers(number).map(userService.add);
}

function newDBUsers(number) {
  var users = _.times(number || 1, function() {
    return {
      username: 'test_' + faker.internet.userName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      avatar: faker.internet.avatar()
    };
  });
  return Promise.map(users, function(user) {
    return User.create(user);
  });
}
function initDB() {
  return newDBUsers(10).then(function(newUsers) {
    return redisService.init(redis.createClient({
      host: 'localhost',
      port: 6379,
      password: 'redisPass'
    })).return(newUsers);
  });
}

function cleanDB() {
  User.remove({'username': /test_.*/i}, _.noop);
  return redisService.clean();
}
