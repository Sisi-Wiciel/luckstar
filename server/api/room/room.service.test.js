var should = require('chai').should();
var roomService = require('./room.service');
var redisService = require('../redis/redis.service');
var utils = require('../../../test/test.utils');
var _ = require('lodash');

var faker = require('faker');

describe('api/room/room.service', function() {
  var admin;
  beforeEach(function() {
    return utils.newUsers().then(function(dbUsers) {
      admin = dbUsers[0];
      return dbUsers;
    });
  });

  after(function() {
    return utils.clean();
  });

  describe('#newRoom', function() {
    it('should create new room, given a room title', function(done) {
      roomService.save({
        title: faker.random.word()
      }, admin.id).then(function(newroom){
        should.exist(newroom);
        should.exist(newroom.id);
        done();
      });
    });
  });

  describe('#joinRoom', function() {
    var room;
    beforeEach(function(done){
      utils.newRoom(admin.id).then(function(newroom){
        room = newroom;
        done();
      });
    });
    it('should user can join a room as a player', function(done) {
      // roomService.join(room, )     
      done();
    });
  });

});