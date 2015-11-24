var topicService = require('../topic/topic.service');
var userService = require('../user/user.service')
var _ = require('lodash');

var saveTopic = function(newTopic, user){
    return topicService.save(newTopic, user);
}

exports.register = function (socket) {

    socket.on('topic save', function (newtopic, cb) {
        userService.list(socket.uid).then(function(users){
            saveTopic(newtopic, _.first(users)).then(cb);
        })

    });

};

exports.deregister = function (socket) {
};