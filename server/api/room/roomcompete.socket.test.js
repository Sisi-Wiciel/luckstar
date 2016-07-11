var should = require('chai').should();
var sinon = require('sinon');
var faker = require('faker');
var _ = require('lodash');

var utils = require('../../../test/test.utils');
var settings = require('../../config/setting');

var socketService = require('../socket/socket.service');
var roomService = require('./room.service');
var topicService = require('../topic/topic.service');
var roomCompeteSocket = require('./roomcompete.socket');

var COUNTDOWN_EVENT_NAME = 'topicCountDownUpdate';
var TOPIC_UPDATE_EVENT_NAME = 'topicUpdate';
var TOPIC_VERDICT_EVENT_NAME = 'topicVerdict';

describe('api/room/roomcompete.socket', function() {
  var emitInAllFunc;
  var room, socket;

  function setup() {
    emitInAllFunc.reset();
    return utils.newRoom().then(function(newRoom) {
      socket = utils.newSocket(newRoom.admin.id);
      room = newRoom;
      socket.room = room.id;
      return roomService.startCompete(room);
    });
  }

  before(function(done) {
    emitInAllFunc = sinon.stub(socketService, "emitInAll");
    done();
  });

  after(function(done) {
    emitInAllFunc.restore();
    done();
  });

  describe('#checkTopic', function(done) {
    beforeEach(function() {
      return setup().then(function() {
        roomCompeteSocket.nextTopic(socket);
      });
    });
    it('should admin can received a verdict event after checkout topic ', function(done) {

      setTimeout(function() {
        roomCompeteSocket.checkTopic(socket, '0');
        setTimeout(function() {
          emitInAllFunc.lastCall.args[1].should.equal(TOPIC_VERDICT_EVENT_NAME);
          done();
        }, 500)

      }, 1000);
    });
  })
  describe('#competeGetTopic', function(done) {
    beforeEach(function() {
      return setup();
    });
    it('should get current topic in competition', function(done) {
      roomCompeteSocket.nextTopic(socket);
      setTimeout(function() {
        roomCompeteSocket.events.competeGetTopic(socket);
      }, 500)

      setTimeout(function() {
        socket.emit.calledOnce.should.true;
        socket.emit.firstCall.args[0].should.equal(TOPIC_UPDATE_EVENT_NAME);
        done();
      }, 1000);
    });
  });

  describe('#start', function() {
    var topicEventFunc;
    beforeEach(function() {
      topicEventFunc = sinon.stub(roomCompeteSocket, 'nextTopic');
      return setup();
    });

    afterEach(function(done) {
      topicEventFunc.restore();
      done();
    });
    it('should received some of countdowns before emit topic', function(done) {
      var COUNTDOWN_TIMES = settings.ROOM.COMPETE_COUNTDOWN_TIMES;

      settings.ROOM.COMPETE_COUNTDOWN_INTERVAL = settings.ROOM.COMPETE_COUNTDOWN_INTERVAL / 100;

      roomCompeteSocket.start(socket, room);
      setTimeout(function() {
        emitInAllFunc.callCount.should.equal(settings.ROOM.COMPETE_COUNTDOWN_TIMES);
        emitInAllFunc.alwaysCalledWith(room.id).should.true;
        topicEventFunc.calledOnce.should.true;
        done();
      }, 1000);

    });
  });

  describe('#nextTopic', function() {

    var updateRoomStatFunc;

    before(function(done) {
      settings.ROOM.COMPETE_TOPIC_COUNTDOWN = settings.ROOM.COMPETE_TOPIC_COUNTDOWN / 100;
      settings.ROOM.COMPETE_MAX_TOPICS = 2;
      settings.ROOM.TOPICI_INTERVAL_TIME = settings.ROOM.TOPICI_INTERVAL_TIME / 100;
      settings.ROOM.COMPETE_TOPIC_COUNTDOWN_SYNC = _.map(settings.ROOM.COMPETE_TOPIC_COUNTDOWN_SYNC, function(value) {
        return value / 100;
      });
      done();
    });
    beforeEach(function() {
      updateRoomStatFunc = sinon.stub(roomService, 'updateRoomStat');
      updateRoomStatFunc.returns(utils.resolve({currNum: 1, maxNum: settings.ROOM.COMPETE_MAX_TOPICS}));
      return setup();
    });

    afterEach(function(done) {
      updateRoomStatFunc.restore();
      done();
    });

    it.only('should received a topic without corrector attr, then start countdown notify', function(done) {
      roomCompeteSocket.nextTopic(socket);
      var nextTopicFunc = sinon.stub(roomCompeteSocket, 'nextTopic');
      setTimeout(function() {
        emitInAllFunc.called.should.true;
        emitInAllFunc.alwaysCalledWith(room.id).should.true;

        var topic_event = 1;
        var verdict_event = 1;
        var next_topics_events_times = topic_event + settings.ROOM.COMPETE_TOPIC_COUNTDOWN_SYNC.length + verdict_event;
        var fininsh_event = 1;

        emitInAllFunc.callCount.should.equal(next_topics_events_times * settings.ROOM.COMPETE_MAX_TOPICS + fininsh_event);

        //Topic event.
        var topicEventCall = emitInAllFunc.firstCall;
        topicEventCall.args[1].should.equal(TOPIC_UPDATE_EVENT_NAME);
        topicEventCall.args[2].should.not.null;
        topicEventCall.args[2].id.should.not.null;
        topicEventCall.args[2].should.not.have.property('corrector');

        //Countdown events.
        _.each(settings.ROOM.COMPETE_TOPIC_COUNTDOWN_SYNC, function(countdown, index) {
          var countdownCall = emitInAllFunc.getCall(index + 1);
          countdownCall.args[1].should.equal(COUNTDOWN_EVENT_NAME);
          countdownCall.args[2].value.should.equal(countdown);
          countdownCall.args[2].max.should.equal(settings.ROOM.COMPETE_TOPIC_COUNTDOWN );
        });

        nextTopicFunc.restore();
        done();
      }, 1000);
    });


    // it.only('should cancel previous topic checkout timer, before the next topic was emitted in the same competition', function(done) {
    //   roomCompeteSocket.nextTopic(socket);
    //   setTimeout(function() {
    //     console.info(emitInAllFunc.callCount);
    //     done();
    //   }, 1000);
    // });

    // it.only('should send the next topic without answer by player, check up on timeout a topic', function(done) {
    //   console.info('callcount:', emitInAllFunc.callCount);
    //   updateRoomStatFunc.returns(utils.resolve({currNum: 1, maxNum: 5}));
    //   sinon.spy(roomCompeteSocket, 'nextTopic');
    //   roomCompeteSocket.nextTopic(socket);
    //   setTimeout(function() {
    //     console.info('callcount:', emitInAllFunc.callCount);
    //     console.info('nexttopic count', roomCompeteSocket.nextTopic.callCount);
    //     done();
    //   }, 1000);
    //
    // });
  });
});
