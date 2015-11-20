var topicService = require('../topic/topic.service');

var saveTopic = function(socket, newTopic){
    return topicService.save(newTopic);
}

exports.register = function (socket) {

    socket.on('topic save', function (newtopic, cb) {
        saveTopic(socket, newtopic).then(cb);
    });

};

exports.deregister = function (socket) {
};