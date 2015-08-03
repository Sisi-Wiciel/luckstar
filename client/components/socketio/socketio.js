define([
  'socketio',
  'lodash',
  'app'
], function(io, _,app){

  app.factory('socketSrv', function(){
    var socket = io.connect('http://localhost:3000');
    return {
      register: function(eventName, cb){
        var _cb = cb || _.noop;
        socket.on(eventName, function(items){
          _cb(items);
        });
      },
      userOnline: function(id){
        socket.emit('user online', id);
      },
      userOffline: function(){
        socket.emit('user offline');
      }
    }
  });

})