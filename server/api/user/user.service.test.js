var should = require('chai').should();
var User = require('./user.model');
var userService = require('./user.service');
var utils = require('../../../test/test.utils');
var Promise = require('bluebird');
var _ = require('lodash');
var faker = require('faker');

describe('api/user/user.service', function() {
  var users = [];
  before(function(done) {
    Promise.map(utils.newUsers(5), function(user) {
      return User.create(user);
    }).then(function(dbusers) {
      users = dbusers;
      done();
    });
  });

  after(function(done) {
    Promise.map(users, function(user) {
      return User.remove({'_id': user._id});
    }).then(function() {
      done();
    });
  });

  describe('#isUniqueName', function() {
    it('should return true when username is unique', function(done) {
      userService.isUniqueName(faker.internet.userName()).then(function(isUnique) {
        isUnique.should.to.be.true;
      }).then(done, done);
    });

    it('should return false when username is not unique', function(done) {
      userService.isUniqueName(users[0].username).then(function(isUnique) {
        isUnique.should.to.be.false;
      }).then(done, done);
    });
  })

});