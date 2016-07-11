var should = require('chai').should();
var _ = require('lodash');
var Promise = require('bluebird');
var faker = require('faker');

var settings = require('../../config/setting');
var utils = require('../../../test/test.utils');
var redisService = require('../redis/redis.service');

var roomService = require('./room.service');
var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');

describe('api/room/room.service', function() {
  var admin, users = [];
  var MAX_TOPICS_NUMBER = 2;
  var preRoomSetting = _.clone(settings.ROOM);
  before(function(done) {
    settings.ROOM.COMPETE_MAX_TOPICS = MAX_TOPICS_NUMBER;
    done();
  });
  after(function(done) {
    settings.ROOM = preRoomSetting;
    done();
  });

  function startUpCompetition() {
    return utils.newRoom().then(function(obj) {
      return roomService.startCompete(obj).then(function() {
        return roomService.list(obj.id);
      });
    });
  }

  beforeEach(function(done) {
    users = this.users;
    admin = users[0];
    done();
  });

  describe('#finishCompete', function() {
    var room;

    beforeEach(function(done) {
      startUpCompetition().then(function(newRoom) {
        room = newRoom;
        done();
      });
    });

    it('should remove key roomtopic from redis', function(done) {
      roomService.finishCompete(room);
      setTimeout(function() {
        redisService.list('roomtopics:' + room.id).then(function(topics) {
          should.equal(topics, null);
          done();
        });
      }, 1000);
    });
  });
  describe('#nextRoomTopic', function() {
    var room;

    beforeEach(function(done) {
      startUpCompetition().then(function(newRoom) {
        room = newRoom;
        done();
      });
    });

    it('should return specified topic from room topicindex', function(done) {
      var topics = []
      room.topicindex = 1;
      roomService.nextRoomTopic(room.id).then(function(topic) {
        should.exist(topic);
        should.exist(topic.id);
        done();
      });
    });

    it('should return null, nextRoomTopic called times exceeded the number of max topics of setting', function(done) {
      var topics = []

      roomService.nextRoomTopic(room.id).then(function(topic) {
        topics.push(topic);
        return roomService.nextRoomTopic(room.id);
      }).then(function(topic) {
        topics.push(topic);
        roomService.nextRoomTopic(room.id).then(function(nullTopic) {
          should.equal(nullTopic, null);
          should.equal(topics.length, 2);
          should.exist(topics[0].id);

          done();
        });
      });
    });

    it('should have many topics belong to the room, after start a competition', function(done) {
      var topics = []

      roomService.nextRoomTopic(room.id).then(function(topic) {
        topics.push(topic);
        return roomService.nextRoomTopic(room.id);
      }).then(function(topic) {
        topics.push(topic);
        topics.length.should.equal(MAX_TOPICS_NUMBER);
        _.filter(topics, {'id': topics[0].id}).length.should.equal(1);
        done();
      });
    });
  });

  describe('#new', function() {
    it('should create new room, given a room title at least', function(done) {
      roomService.save({
        title: faker.random.word()
      }, admin.id).then(function(newroom) {
        newroom.should.not.null;
        newroom.id.should.not.null;
        done();
      });
    });

    it('should admin was in that room, when it created', function(done) {
      roomService.save({
        title: faker.random.word()
      }, admin.id).then(function(newroom) {
        roomService.list(newroom.id).then(function(room) {
          room.admin.id.should.equal(admin.id);
          room.users.length.should.equal(1);
          room.users[0].id.should.equal(admin.id);
          done();
        });

      });
    });
  });

  describe('#join', function() {
    var room;
    beforeEach(function(done) {
      utils.newRoom().then(function(newroom) {
        room = newroom;
        done();
      });
    });
    it('should user can join a room as a player', function(done) {

      utils.newUsers().then(function(users) {
        roomService.join(room, users[0]).then(function(room) {
          if (room.number === 1) {
            room.users.length.should.equal(1);
            room.obs.length.should.equal(0);
          } else {
            room.users.length.should.equal(2);
            room.obs.length.should.equal(0);
            room.users.pop().id.should.equal(users[0].id);
          }

          done();
        }).catch(done);
      });
    });

    it('should at most of users in room can join room as a player', function(done) {
      utils.newUsers(room.number - 1).then(function(newUsers) {
        var promises = [];
        _.each(newUsers, function(player) {
          promises.push(roomService.join(room, player));
        });
        Promise.all(promises).then(function() {
          roomService.list(room.id).then(function(room) {
            room.users.length.should.equal(room.number);
            done();
          }).catch(done);
        });
      });
    });

    it('should join room as observer automatically on more then the max of users in room ', function(done) {
      utils.newUsers(room.number).then(function(newUsers) {
        var promises = [];
        _.each(newUsers, function(player, index) {
          promises.push(roomService.join(room, player));
        });
        Promise.all(promises).then(function() {
          roomService.list(room.id).then(function(room) {
            room.users.length.should.equal(room.number);
            room.obs.length.should.equal(1);
            done();
          }).catch(done);
        });
      });
    });

    it('should user can join room as observer', function(done) {
      utils.newUsers(10).then(function(newUsers) {
        var promises = [];
        _.each(newUsers, function(player, index) {
          promises.push(roomService.join(room, player, false));
        });
        Promise.all(promises).then(function() {
          roomService.list(room.id).then(function(room) {
            room.users.length.should.equal(1);
            room.obs.length.should.equal(10);
            done();
          }).catch(done);
        });
      });
    });

    it('should not join the same room as a player', function(done) {
      utils.newUsers().then(function(users) {
        var player = users[0];
        roomService.join(room, player);
        roomService.join(room, player);
        roomService.list(room.id).then(function(room) {
          room.users.length.should.equal(1);
          done();
        }).catch(done);
      });
    });

    it('should not join the same room as a observer', function(done) {
      utils.newUsers().then(function(users) {
        var player = users[0];
        roomService.join(room, player, false);
        roomService.join(room, player, false);
        roomService.list(room.id).then(function(room) {
          room.users.length.should.equal(1);
          done();
        }).catch(done);
      });
    });
``
    it('should can change the role of user between player and observer', function(done) {
      utils.newUsers().then(function(users) {
        var player = users[0];
        roomService.join(room, player).then(function(room) {
          roomService.join(room, player, false).then(function() { // changed its role
            roomService.list(room.id).then(function(room) {
              room.users.length.should.equal(1); //only room admin
              room.obs.length.should.equal(1); // one player

              roomService.join(room, player).then(function() {
                roomService.list(room.id).then(function(room) {
                  room.users.length.should.equal(2);//Sometime test failed
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
  describe('#leave', function() {
    var room;

    beforeEach(function(done) {
      utils.newRoom().then(function(newroom) {
        room = newroom;
        done();
      });
    });

    it('should user as player can leave from room', function(done) {
      utils.newUsers().then(function(users) {
        var player = users[0];
        roomService.join(room, player).then(function(room) {
          roomService.leave(room, player).then(function() {
            roomService.list(room.id).then(function(room) {
              room.users.length.should.equal(1); //only admin user
              room.admin.should.not.null;
              room.users[0].id.should.equal(room.admin.id);
              done();
            });
          });
        })
      }).catch(done);
    });


    it('should close room when the role of admin user leave room', function(done) {
      userService.list(room.admin.id).then(function(roomAdmin) {
        roomService.leave(room, roomAdmin).then(function() {
          roomService.list(room.id).then(function(nullRoom) {
            should.equal(nullRoom, null);
            done();
          });
        });
      });
    });
  });
});