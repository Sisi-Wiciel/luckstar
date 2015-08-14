var socketio = require('../api/socket/socket.service');

module.exports = {
  init: function(){
    socketio.init();
  }
}
