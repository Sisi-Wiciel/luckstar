define([
  'angular',
  'app',
  'angularMocks'
], function (angular) {
  'use strict';

  var mockdata = {
    topic: {
      "_id": "558b647b86e86b5c201d5529",
      "title": "属于国家一类保护动物的是：",
      "options": ["天鹅", "娃娃鱼", "孔雀", "丹顶鹤"]
    },
    correct: 3,
    incorrect: 2,
  };

  var mockdatas = [{
    topic: {
      "_id": "558b647b86e86b5c201d5529",
      "title": "属于国家一类保护动物的是：",
      "options": ["天鹅", "娃娃鱼", "孔雀", "丹顶鹤"]
    },
    correct: 3,
    incorrect: 2,
  }, {
    topic: {
      "_id": "558b647c86e86b5c201d5571",
      "title": "举重时运动员为什么搓白粉？",
      "options": ["使手变的粗糙", "吸取手上的汗", "刺激肌肉", "保护皮肤"]
    },
    correct: 1,
    incorrect: 0
  }]

  describe('Service: topicService', function () {

    beforeEach(module('luckStar'));

    var topic, httpBackend, Topic;

    beforeEach(inject(function ($injector) {
      httpBackend = $injector.get('$httpBackend');
    }));

    beforeEach(inject(function (_Topic_) {
      var _except = mockdata.topic;
      httpBackend.expectGET("/api/topic").respond(200, JSON.stringify(_except));
      Topic = _Topic_;
      topic = _Topic_.get();
      httpBackend.flush();
    }));

    it('ensure a topic can be received with no corrector attr', function () {
      var _except = mockdata.topic;
      expect(topic._id).toEqual(_except._id);
      expect(topic.title).toEqual(_except.title);
      expect(topic.options).toEqual(_except.options);
      expect(topic.corrector).toBeUndefined();
      expect(topic.isActived()).toBe(false);
      expect(topic.$save).not.toBe(undefined);
    });

    it('ensure some of topics can be received', function () {
      var expectdata = _.pluck(mockdatas, 'topic');
      httpBackend.expectGET("/api/topic").respond(200, JSON.stringify(expectdata));

      var topices = Topic.query();
      httpBackend.flush();

      expect(topices.length).toEqual(expectdata.length);

      _.each(topices, function(topic, index){
        expect(topic._id).toEqual(expectdata[index]._id);
        expect(topic.title).toEqual(expectdata[index].title);
        expect(topic.options).toEqual(expectdata[index].options);
        expect(topic.corrector).toBeUndefined();
        expect(topic.isActived()).toBe(false);
        expect(topic.$save).not.toBe(undefined);
      })

    });

    it('ensure marked as correct status', function () {
      //it's correct
      expect(topic.isActived()).toBe(false);
      var topicId = topic._id;

      var resultmsg = {"message": mockdata.topic.options[mockdata.correct], "status": 0};

      httpBackend.expectPOST('/api/topic/' + mockdata.topic._id + '/checkup?option=' + mockdata.correct)
        .respond(200, JSON.stringify(resultmsg));

      topic.$check({option: mockdata.correct});
      httpBackend.flush();

      expect(topic.isCorrect()).toBe(true);
      expect(topic.isInCorrect()).toBe(false);
      expect(topic.isTimeout()).toBe(false);

      expect(topicId).toEqual(topic._id);
      expect(topic.isActived()).toBe(true);
    });

    it('ensure topic marked as incorrect status', function () {
      //it's incorrect
      expect(topic.isActived()).toBe(false);

      var topicId = topic._id;

      var resultmsg = {"message": mockdata.topic.options[mockdata.correct], "status": 1};

      httpBackend.expectPOST('/api/topic/' + mockdata.topic._id + '/checkup?option=' + mockdata.incorrect)
        .respond(200, JSON.stringify(resultmsg));

      topic.$check({option: mockdata.incorrect});
      httpBackend.flush();

      expect(topic.isCorrect()).toBe(false);
      expect(topic.isInCorrect()).toBe(true);
      expect(topic.isTimeout()).toBe(false);
      expect(topic.message).toEqual(mockdata.topic.options[mockdata.correct]);

      expect(topicId).toEqual(topic._id);

      expect(topic.isActived()).toBe(true);
    });

    it('ensure topic marked as timeout status', function () {

      var resultmsg = {"message": mockdata.topic.options[mockdata.correct], "status": 2};

      var topicId = topic._id;
      expect(topic.isActived()).toBe(false);

      httpBackend.expectPOST('/api/topic/' + mockdata.topic._id + '/checkup?option=').respond(200, JSON.stringify(resultmsg));

      topic.$check();

      httpBackend.flush();

      expect(topic.isCorrect()).toBe(false);
      expect(topic.isInCorrect()).toBe(false);
      expect(topic.isTimeout()).toBe(true);
      expect(topic.message).toEqual(mockdata.topic.options[mockdata.correct]);

      expect(topicId).toEqual(topic._id);
      expect(topic.isActived()).toBe(true);
    });



  });
});
