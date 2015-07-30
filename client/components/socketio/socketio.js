define([
  'socketio',
  'lodash',
  'app'
], function(io, _,app){

  app.factory('socketSrv', function(){
    var socket = io.connect('http://localhost:3000');
    return {
      register: function(eventName, arr, cb){
        var _cb = cb || _.noop;
        socket.on(eventName, function(items){
          if(_.isArray(items)){
            _.each(items, function(item){
              arr.push(item);
            })
            //_.assign(arr, items);
          }else{
            arr.push(item);
          }
          _cb();
        });
      },
      online: function(id){
        socket.emit('online', id);
      }
    }
  });

})