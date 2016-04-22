var db = require('../redis/redis.service');
var Topic = require('./topic.model');
var TopicBug = require('./bug/topic.bug.model');
var errorHandler = require('express-error-handler');
var userService = require('../user/user.service');
var _ = require('lodash');

function updateTopic(id, data) {
  return Topic.update({_id: id}, data).exec();
}

function getTopic(id) {
  var promise;
  if (id) {
    promise = Topic.findById(id).exec().then(function(topic) {
      return topic.toJSON();
    });
  } else {
    promise = db.random('topics', 1).then(JSON.parse);
  }

  return promise && promise.then(function(topic) {
    topic.answercount = topic.corrector.length;
    delete topic.corrector;
    if (topic.creator) {
      return userService.list(topic.creator).then(function(creator) {
        topic.creatorUsername = creator.username;
        return topic;
      })
    }
    return topic;
  })
};

function isCorrect(id, answer) {
  return Topic.findById(id).exec().then(function(topic) {
    var _topic = topic.toJSON();
    var ret = {
      point: _topic.point,
      verdict: _topic.corrector.join('') == answer.split('').sort().join('') ? 1 : 0
    }

    return ret;
  })
};

function saveTopic(newtopic, creator) {
  newtopic.creator = creator.id;
  return Topic.create(newtopic);
};

function getTotalSize() {
  return db.size("topics");
};

function reportTopicBug(userid, topicid) {
  return TopicBug.create({
    user: userid,
    topic: topicid
  })
};

exports.get = getTopic;
exports.topicBug = reportTopicBug;
exports.save = saveTopic;
exports.update = updateTopic;
exports.isCorrect = isCorrect;
exports.getTotalSize = getTotalSize;
