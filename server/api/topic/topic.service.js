var db = require('../redis/redis.service');
var Topic = require('./topic.model');
var errorHandler = require('express-error-handler');
var userService = require('../user/user.service');
var _ = require('lodash');

var updateTopic = function(id, data){
    return Topic.update({_id: id}, data).exec();
}
var getTopic = function (id) {

    var promise ;
    if (id) {
        promise = Topic.findById(id).exec().then(function(topic) {
            return topic.toJSON();
        });
    } else {
        promise = db.random('topics', 1).then(JSON.parse);
    }

    return promise && promise.then(function(topic){
        topic.answercount = topic.corrector.length;
        delete topic.corrector;
        if(topic.creator){
            return userService.list(topic.creator).get(0).then(function(creator){
                topic.creatorUsername = creator.username;
                return topic;
            })
        }
        return topic;
    })
};

var isCorrect = function (id, answer) {
    return Topic.findById(id).exec().then(function (topic) {
        var _topic = topic.toJSON();
        var ret = {
            point: _topic.point,
            verdict: _topic.corrector.join('') == answer.split('').sort().join('') ? 1: 0
        }

        return ret;
    })
};

var saveTopic = function (newtopic, creator) {
    newtopic.creator = creator.id;
    return Topic.create(newtopic);
};

var getTotalSize = function(){
    return db.size("topics");
}
exports.get = getTopic;
exports.save = saveTopic;
exports.update = updateTopic;
exports.isCorrect = isCorrect;
exports.getTotalSize = getTotalSize;