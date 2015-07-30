var redis = require('../../config/redis');
'use strict';

exports.register = function(socket) {
  socket.on('online', function(id){
    console.info("socket online", id)
    redis.online(id, function(){
      console.info("online success");
      redis.getUsersWithStatus(function(users){
        console.info(users);
        socket.emit("users", users);
      })
    })

  });
};

exports.deregister = function(socket){

}