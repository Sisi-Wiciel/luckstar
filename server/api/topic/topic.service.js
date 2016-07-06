var _ = require('lodash');

var db = require('../redis/redis.service');
var Topic = require('./topic.model');
var TopicBug = require('./bug/topic.bug.model');
var userService = require('../user/user.service');

var log = require('../../log');

module.exports = {
  getTopic: getTopic,
  fetchTopic: fetchTopic,
  topicBug: reportTopicBug,
  save: saveTopic,
  update: updateTopic,
  isCorrect: isCorrect,
  getTotalSize: getTotalSize
}

function assembleTopic(topic) {
  if(typeof topic.toJSON === "function"){
    topic = topic.toJSON();
  }
  if(_.isString(topic)){
    topic = JSON.parse(topic);
  }
  topic.id = topic._id.toString();
  topic.answercount = topic.corrector.length;
  delete topic.corrector;
  delete topic._id;
  if (topic.creator) {
    return userService.list(topic.creator).then(function(creator) {
      topic.creatorUsername = creator.username;
      return topic;
    })
  }
  return Promise.resolve(topic);
}

function updateTopic(id, data) {
  return Topic.update({_id: id}, data).exec();
}

function fetchTopic(numbers) {
  return db.random('topics', numbers).map(assembleTopic);
}

function getTopic(id) {
  if (_.isEmpty(id)) {
    return Promise.reject(null);
  }
  return Topic.findById(id).exec().then(assembleTopic);
};

function isCorrect(id, answer) {
  log.verbose('topic.service#isCorrect', id, answer);
  return Topic.findById(id).exec().then(function(topic) {
    return {
      point: topic.point,
      verdict: topic.corrector.join('') == answer.split('').sort().join('') ? 1 : 0
    };
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

