var should = require('chai').should();
var roomService = require('./room.service');
var utils = require('../../../test/test.utils');
var _ = require('lodash');
var Promise = require('bluebird');
var faker = require('faker');

describe('api/room/room.service', function () {
  var admin;
  beforeEach(function (done) {
    return utils.newUsers().then(function (dbUsers) {
      admin = dbUsers[0];
      done();
    });
  });

  after(function () {
    return utils.clean();
  });
  describe('#new', function () {
    it('should create new room, given a room title at least', function (done) {
      roomService.save({
        title: faker.random.word()
      }, admin.id).then(function (newroom) {
        should.exist(newroom);
        should.exist(newroom.id);
        done();
      });
    });

    it('should admin was in that room, when it created', function (done) {
      roomService.save({
        title: faker.random.word()
      }, admin.id).then(function (newroom) {
        roomService.list(newroom.id).then(function (room) {
          console.info(room);
          room.admin.id.should.equal(admin.id);
          room.users.length.should.equal(1);
          room.users[0].id.should.equal(admin.id);
          done();
        });

      });
    });
  });

  describe('#join', function () {
    var room;
    beforeEach(function (done) {
      utils.newRoom(admin.id).then(function (newroom) {
        room = newroom;
        done();
      });
    });
    it('should user can join a room as a player', function (done) {

      utils.newUsers().then(function (newUsers) {
        var player = newUsers[0];
        roomService.join(room, player).then(function (room) {
          if (room.number === 1) {
            room.users.length.should.equal(1);
            room.obs.length.should.equal(0);
          } else {
            room.users.length.should.equal(2);
            room.obs.length.should.equal(0);
            room.users.pop().id.should.equal(player.id);
          }

          done();
        }).catch(done);
      });
    });

    it('should at most of users in room can join room as a player', function (done) {
      utils.newUsers(room.number - 1).then(function (newUsers) {
        var promises = [];
        _.each(newUsers, function (player) {
          promises.push(roomService.join(room, player));
        });
        Promise.all(promises).then(function () {
          roomService.list(room.id).then(function (room) {
            room.users.length.should.equal(room.number);
            done();
          }).catch(done);
        });
      });
    });

    it('should join room as observer automatically on more then the max of users in room ', function (done) {
      utils.newUsers(room.number).then(function (newUsers) {
        var promises = [];
        _.each(newUsers, function (player, index) {
          promises.push(roomService.join(room, player));
        });
        Promise.all(promises).then(function () {
          roomService.list(room.id).then(function (room) {
            room.users.length.should.equal(room.number);
            room.obs.length.should.equal(1);
            done();
          }).catch(done);
        });
      });
    });

    it('should user can join room as observer', function (done) {
      utils.newUsers(10).then(function (newUsers) {
        var promises = [];
        _.each(newUsers, function (player, index) {
          promises.push(roomService.join(room, player, false));
        });
        Promise.all(promises).then(function () {
          roomService.list(room.id).then(function (room) {
            room.users.length.should.equal(1);
            room.obs.length.should.equal(10);
            done();
          }).catch(done);
        });
      });
    });

    it('should not join the same room as a player', function () {
      utils.newUsers().then(function (users) {
        var player = users[0];
        roomService.join(room, player);
        roomService.join(room, player);
        roomService.list(room.id).then(function (room) {
          room.users.length.should.equal(1);
          done();
        }).catch(done);
      });
    });

    it('should not join the same room as a observer', function (done) {
      utils.newUsers().then(function (users) {
        var player = users[0];
        roomService.join(room, player, false);
        roomService.join(room, player, false);
        roomService.list(room.id).then(function (room) {
          room.users.length.should.equal(1);
          done();
        }).catch(done);
      });
    });

    it('should can change the role of user between player and observer', function (done) {
      utils.newUsers().then(function (users) {
        var player = users[0];
        roomService.join(room, player).then(function (room) {
          roomService.join(room, player, false).then(function () { // changed its role
            roomService.list(room.id).then(function (room) {
              room.users.length.should.equal(1); //only room admin
              room.obs.length.should.equal(1); // one player

              roomService.join(room, player).then(function () {
                roomService.list(room.id).then(function (room) {
                  room.users.length.should.equal(2);
                  room.obs.length.should.equal(0);
                  done();
                });
              });

            });
          });
        }).catch(done);

      });
    });
  });
  describe('#leave', function () {
    var room;

    beforeEach(function (done) {
      utils.newRoom(admin.id, 5).then(function (newroom) {
        room = newroom;
        done();
      });
    });


    it('should user as player can leave from room', function (done) {
      utils.newUsers().then(function (users) {
        var player = users[0];
        roomService.join(room, player).then(function (room) {
          roomService.leave(room, player).then(function () {
            roomService.list(room.id).then(function (room) {
              room.users.length.should.equal(1); //only admin user
              room.admin.should.not.null;
              room.users[0].id.should.equal(room.admin.id);
              done();
            });
          });
        })
      }).catch(done);
    });


    it('should close room when the role of admin user leave room', function (done) {
      roomService.leave(room, admin).then(function () {
        roomService.list(room.id).then(function (nullRoom) {
          should.equal(nullRoom, null);
          done();
        });
      });
    });
  });
})
;
