var should = require('chai').should();
var roomSocket = require('rewire')('./room.socket');
var utils = require('../../../test/test.utils');
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
    return utils.clean();
  });

  describe('#roomJoin', function() {
    var socket, admin;
    beforeEach(function (done) {
      admin = users[0];
      socket = utils.newSocket(admin.id);
      done();
    });

    // it('should a room creator can join room as admin', function(done) {
    //   var admin = users[0];
    //   utils.newRoom(admin.id).then(function(newRoom){
    //     roomSocket.events.roomJoin(socket, newRoom.id);
    //     done();
    //   });
    // });
    it('should emit null, if room not existed', function(done) {
      var fakeRoomId = faker.random.uuid();
      roomSocket.events.roomJoin(socket, fakeRoomId);
      setTimeout(function () {
        socket.emit.withArgs('updateRoom', null).calledOnce.should.true;
        done();
      }, 1000);
    });

    //it('should can join room as player', function(done) {
    //});
    //it('should can join room as observer ', function(done) {});
    //it('should can join room as observer', function(done) {});
  });


});
