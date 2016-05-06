var should = require('chai').should();
var roomSocket = require('rewire')('./room.socket');
var utils = require('../../../test/test.utils');
var _ = require('lodash');

var faker = require('faker');


describe('api/room/room.socket', function() {
  var users = [];
  before(function() {
    return utils.newUsers(3).then(function(dbUsers) {
      users = dbUsers;
      return dbUsers;
    });
  });

  after(function() {
    return utils.removeUsers(users);
  });


  describe('#joinRoom', function() {
    it('should a room creator can join room as admin', function(done) {
      var admin = users[0];
      var socket = utils.newSocket(admin.id);
      roomSocket.__get__('joinRoom')(socket, admin.id);
      done();
    });

    //it('should can join room as player', function(done) {
    //});
    //it('should can join room as observer ', function(done) {});
    //it('should can join room as observer', function(done) {});
  });


});