var should = require('chai').should();
var utils = require('../../../test/test.utils');
var Promise = require('bluebird');
var _ = require('lodash');
var faker = require('faker');

var topicService = require('./topic.service');

describe('api/topic/topic.service', function() {

  describe('#getTopic', function() {
    var topic;
    beforeEach(function() {
      return topicService.fetchTopic(1).then(function(redisTopics) {
        topic = _.first(redisTopics);
      });
    });
    it('should get a topic from db without attribute "_id" and "corrector"', function(done) {
      topic.id.should.not.null;
      topicService.getTopic(topic.id).then(function(dbTopic) {
        dbTopic.should.not.null;
        dbTopic.id.should.equal(topic.id);
        _.isEmpty(dbTopic._id).should.true;
        _.isEmpty(dbTopic.corrector).should.true;
        done();
      });
    });
  });
  describe('#fetchTopic', function() {
    it('should return specified number topics', function(done) {
      var TOPIC_NUMBER = ~~(Math.random() * 20) + 1;
      topicService.fetchTopic(TOPIC_NUMBER).then(function(topics) {
        topics.should.not.null;
        topics.length.should.equal(TOPIC_NUMBER);
        done();
      });
    });
  })

});