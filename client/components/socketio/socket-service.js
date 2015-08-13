define([
  'socketio',
  'lodash',
  'app'
], function(io, _,app){

  app.factory('socketSrv', function(httpq, store){
    var connect = function(namespace){
      var namespace = namespace || "";
      return io.connect('http://localhost:8889/'+namespace);
    }

    var socket = connect();

    socket.on('connect', function(){
      socket.emit('authenticate', {token: store.get('token')});
    });

    return {
      connect: connect,
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
      },
      sendMsg: function(from, to, msg){
        socket.emit('send message', {
          from: from,
          to: to,
          content: msg
        });
      }
    }
  });

})