var mongoose = require("mongoose");
var _ = require('lodash');

var userService = require('../server/api/user/user.service');
var roomService = require('../server/api/room/room.service');
var faker = require('faker');
var Promise = require('bluebird');
var redisSrv = require('../server/api/redis/redis.service');
var redis = require('then-redis');
var sinon = require('sinon');

faker.locale = 'zh_CN';

mongoose.connect('mongodb://localhost/luckstar');

redisSrv.init(redis.createClient({
  host: 'localhost',
  port: 6379,
  password: 'redisPass'
}));

var User = require('../server/api/user/user.model');

module.exports = {
  newSocket: function(userid) {
    function socket(){
      this.uid = userid;
      this.emit = sinon.spy();
      this.join = sinon.spy();
      this.close = sinon.spy()
      this.io = {
        sockets: {
          in: function(id){
            return new socket(id);
          }
        }
      }
    }
  
    return new socket(userid);
  },
  newRoom: function(userid){
    return roomService.save({
      title: faker.name.title()
    }, userid);
  },
  newUsers: function(number) {

    number = number || 1;
    var users = _.times(number, function() {
      return {
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        avatar: faker.internet.avatar()
      };
    });

    return Promise.map(users, function(user) {
      return User.create(user).then(function(dbUser) {
        return userService.add(dbUser);
      });
    })
  },
  removeUsers: function(users) {
    return Promise.map(users, function(user) {
      if (!_.isEmpty(user.id)) {
        // console.info("Remove user id ", user.id);
        return User.remove({'_id': user.id})
      } else {
        return Promise.reject('User must has id or _id property');
      }
    });
  }
};


