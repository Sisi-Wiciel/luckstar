var db = require('../redis/redis.service');
var Topic = require('./topic.model');
var errorHandler = require('express-error-handler');
var Promise = require('bluebird');

var getTopic = function(){
    return db.random('topics', 1).then(JSON.parse);
}

var isCorrect = function(id, answer){
    return new Promise(function(resolve, reject) {
        Topic.findById(id, function (err, topic) {
            if(err){
                errorHandler(err);
            }else{
                if(topic.corrector.toString() == answer.toString()){
                    resolve(topic.point);
                }else{
                    reject(topic.point);
                }

            }
        })
    });
};


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