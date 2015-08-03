var sio = require('socket.io'),
  userSocket = require('../api/user/user.socket');

function onConnect(socket){
  userSocket.register(socket);
}

function onDisconnect(socket){
  userSocket.deregister(socket);
}

module.exports = function(server){
  var socketio = sio(server);
  socketio.on('connection', function (socket) {

    socket.connectedAt = new Date();

    socket.io = socketio;

    // Call onDisconnect.
    socket.on('disconnect', function () {
      onDisconnect(socket);
      console.info('SOCKET DISCONNECTED');
    });

    // Call onConnect.
    onConnect(socket);
    console.info('SOCKET CONNECTED');
  });
}

