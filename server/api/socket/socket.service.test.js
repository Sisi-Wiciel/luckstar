var should = require('chai').should();
var utils = require('../../../test/test.utils');
var Promise = require('bluebird');
var _ = require('lodash');
var faker = require('faker');

var socketService = require('./socket.service');

describe('api/socket/socket.service', function() {
  before(function() {

  });

  after(function() {
  });

  describe('#getSocketByUser', function() {
    it('should return null if user is empty', function(done) {
      should.equal(socketService.getSocketByUser(null), null);
      done();
    });

    it('should return null if user sid is empty', function(done) {
      utils.newUsers(1).get(0).then(function(unSignedinUser) {
        should.equal(socketService.getSocketByUser(unSignedinUser), null);
      }).then(done, done);
    });

    it('should return null if user has not sid property', function(done) {
      utils.newUsers(1).get(0).then(function(unSignedinUser) {
        delete unSignedinUser.sid;
        should.equal(socketService.getSocketByUser(unSignedinUser), null);
      }).then(done, done);
    });
  })

});