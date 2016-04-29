var mongoose = require("mongoose");
var _ = require('lodash');
var faker = require('faker');
faker.locale = 'zh_CN';

mongoose.connect('mongodb://localhost/luckstar');


module.exports = {
  newUsers: function(number) {
    number = number || 1;
    return _.times(number, function() {
      return {
        username: faker.internet.userName(),
        password: faker.internet.password(),
        email: faker.internet.email(),
        avatar: faker.internet.avatar()
      };
    });
  }
};

