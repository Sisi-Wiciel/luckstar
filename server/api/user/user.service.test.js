var should = require('chai').should();
var User = require('./user.model');
var userService = require('rewire')('./user.service');
var utils = require('../../../test/test.utils');
var Promise = require('bluebird');
var _ = require('lodash');

var faker = require('faker');

describe('api/user/user.service', function() {

  describe('#isUniqueName', function() {

    it('should return true when username is unique', function() {
      return userService.isUniqueName(faker.internet.userName()).then(function(isUnique) {
        isUnique.should.to.be.true;
        return isUnique;
      });
    });

    it('should return false when username is not unique', function() {
      return userService.isUniqueName(this.users[0].username).then(function(isUnique) {
        isUnique.should.to.be.false;
        return isUnique;
      });
     });
  });

});