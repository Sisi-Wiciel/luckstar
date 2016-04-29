var should = require('chai').should();
var User = require('./user.model');
var userService = require('./user.service');
var utils = require('../../../test/test.utils');
var Promise = require('bluebird');
var _ = require('lodash');
var faker = require('faker');

describe('api/user/user.service', function() {
  var users = [];
  before(function() {
    return Promise.map(utils.newUsers(5), function(user) {
      return User.create(user);
    }).then(function(dbusers) {
      users = dbusers;
      return dbusers;
    });
  });

  after(function() {
    return Promise.map(users, function(user) {
      return User.remove({'_id': user._id});
    });
  });

  describe('#isUniqueName', function() {
    it('should return true when username is unique', function() {
      return userService.isUniqueName(faker.internet.userName()).then(function(isUnique) {
        isUnique.should.to.be.true;
        return isUnique;
      });
    });

    it('should return false when username is not unique', function() {
      return userService.isUniqueName(users[0].username).then(function(isUnique) {
        isUnique.should.to.be.false;
        return isUnique;
      });
    });
  })

});