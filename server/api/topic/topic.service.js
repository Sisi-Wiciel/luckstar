var db = require('../redis/redis.service');
var Topic = require('./topic.model');
var errorHandler = require('express-error-handler');
var RSVP = require('rsvp');

var getTopic = function(number){
    return db.random('topics', 1).then(function(topics){
        return JSON.parse(topics)
    });
}

var isCorrect = function(id, answer){
    return new RSVP.Promise(function(resolve, reject) {
        Topic.findById(id, "+corrector", function (err, topic) {
            if(err){
                errorHandler(err);
            }else{
                if(topic.corrector.toString() == answer.toString()){
                    resolve();
                }else{
                    reject();
                }

            }
        })
    });

}
var saveTopic = function(topic){
    Topic.create(topic, function (err, topic) {
        if (err) {
            return errorHandler(res, err);
        }
        return db.addTopic(topic);
    });
};


exports.get = getTopic;
exports.save = saveTopic;
exports.isCorrect = isCorrect;