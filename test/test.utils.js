var mongoose = require("mongoose");
var _ = require('lodash');
var redisService = require('../server/api/redis/redis.service');
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
  clean: function(){
    User.remove({}, _.noop);
    return redisService.clean();
  },
  newSocket: function(userid) {
    function Socket(){
      this.uid = userid;
      this.emit = sinon.spy();
      this.join = sinon.spy();
      this.close = sinon.spy();
      this.io = {
        sockets: {
          in: function(id){
            return new Socket(id);
          }
        }
      }
    }

    return new Socket(userid);
  },
  newRoom: function(userid){
    return roomService.save({
      title: faker.name.title(),
      number: ~~(Math.random()* 10 + 1)
    }, userid).then(function (room) {
      return roomService.list(room.id);
    });
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
  }
};


