var should = require('chai').should();
var utils = require('../../../test/test.utils');
var _ = require('lodash');

var faker = require('faker');


describe('api/room/room.service', function() {
  var users = [];
  before(function() {
    return utils.newUsers().then(function(dbUsers) {
      users = dbUsers;
      return dbUsers;
    });
  });

  after(function() {
    return utils.removeUsers(users);
  });

  describe('#newRoom', function() {
    it('should create new room, given a room title', function(done) {
      var admin = users[0];
     
      utils.newRoom(admin.id).then(function(newroom){
        should.exist(newroom);
        should.exist(newroom.id);
        done();
      });
    });
  });


});