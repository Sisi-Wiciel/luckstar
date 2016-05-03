var mongoose = require("mongoose");
var _ = require('lodash');
var User = require('../server/api/user/user.model');
var faker = require('faker');
var Promise = require('bluebird');
faker.locale = 'zh_CN';

mongoose.connect('mongodb://localhost/luckstar');


module.exports = {
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
      return User.create(user);
    })
  }
};

