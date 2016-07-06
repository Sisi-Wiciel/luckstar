var should = require('chai').should();
var utils = require('../../../test/test.utils');
var Promise = require('bluebird');
var _ = require('lodash');
var faker = require('faker');

var socketService = require('./socket.service');

describe('api/socket/socket.service', function() {

  describe('#getSocketByUser', function() {
    it('should get socket is null value if user obj is invaild', function(done) {
      should.equal(socketService.getSocketByUser(null), null);

      var user = this.users[1];
      delete user.sid;
      should.equal(socketService.getSocketByUser(user), null);
      done();
    });
  })

});