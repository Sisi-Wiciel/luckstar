var should = require('chai').should();
var utils = require('../../../test/test.utils');
var Promise = require('bluebird');
var _ = require('lodash');
var faker = require('faker');

var socketService = require('./socket.service');

describe('api/socket/socket.service', function() {
  var users = [];
  before(function() {
    utils.newUsers(2).then(function(newUser){
      users = newUser;
    });
  });

  after(function() {
    return utils.clean();
  });

  describe('#getSocketByUser', function() {
    it('should return null if user is empty', function(done) {
      should.equal(socketService.getSocketByUser(null), null);
      done();
    });

    it('should return null if user sid is empty', function(done) {
        should.equal(socketService.getSocketByUser(users[0]), null);
        done();
    });

    it('should return null if user has not sid property', function(done) {
        var user = users[1];
        delete user.sid;
        should.equal(socketService.getSocketByUser(user), null);
        done();
    });
  })

});