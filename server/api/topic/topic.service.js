var db = require('../redis/redis.service');
var Topic = require('./topic.model');
var errorHandler = require('express-error-handler');

var getTopic = function (id) {
    if (id) {
        return Topic.findById(id).exec();
    } else {
        return db.random('topics', 1).then(JSON.parse);
    }

};

var isCorrect = function (id, answer) {
    return Topic.findById(id).exec().then(function (topic) {
        var ret = {
            point: topic.point
        }
        topic.corrector.toString() == answer.toString() ? ret.verdict = 1 : ret.verdict = 0;
        return ret;
    })
};

var saveTopic = function (newtopic) {
    return Topic.create(newtopic).then(function(topic){
        return db.addTopic(topic);
    });
};

exports.get = getTopic;
exports.save = saveTopic;
exports.isCorrect = isCorrect;