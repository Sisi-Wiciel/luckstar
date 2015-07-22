define([
  'angular',
  'lodash',
  'app',
  'angularMocks'
], function (angular, _) {
  'use strict';

  var mockdata = [{
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
  }, {
    topic: {
      "_id": "558b647c86e86b5c201d5563",
      "title": "非洲国家边界按什么划分的最多？",
      "options": ["直线或曲线的几何方法", "经线或纬线", "河流、山脉等自然地貌"]
    },
    correct: 1,
    incorrect: 3
  }, {
    topic: {
      "_id": "558b647b86e86b5c201d553b",
      "title": "举重比赛的级别是按：",
      "options": ["杠铃重量划分", "运动员体重划分", "按年龄划分"]
    },
    correct: 3,
    incorrect: 2
  }];

  var matchId = _.random(0, 50);

  describe('Service: matchService', function () {

    beforeEach(module('luckStar'));

    var matchSrv, httpBackend, User;

    beforeEach(inject(function ($injector) {
      httpBackend = $injector.get('$httpBackend');
      matchSrv = $injector.get('matchSrv');
      User = $injector.get('User');
    }));

    beforeEach(function () {
      var resultmsg = mockdata

      httpBackend.expectPOST('/api/match/startup/'+mockdata.length)
        .respond(200, JSON.stringify({id: matchId}));

      httpBackend.expectGET('/api/topic')
        .respond(200, JSON.stringify(_.pluck(mockdata, "topic")));

      matchSrv.start(mockdata.length);
      httpBackend.flush();
    });

    it('should received some kinds of topics when starting a match', function () {
      expect(matchSrv.id).toEqual(matchId);
      expect(mockdata.length).toEqual(matchSrv.topics.length);
    });

    it('should get next topic while playing', function () {
      var topic = matchSrv.next();
      expect(topic._id).toEqual(mockdata[0].topic._id);
      expect(0).toEqual(matchSrv.currIndex);

      topic = matchSrv.next();
      expect(topic._id).toEqual(mockdata[1].topic._id);
      expect(1).toEqual(matchSrv.currIndex);
    });

  });
});
