define([
  'socketio',
  'lodash',
  'app',
  'settings'
], function(io, _, app, settings) {
  app.factory('socketSrv', function(httpq, store, $q) {
    var socket = null;
    var onAuthSuccess = _.noop;
    var onAuthFailed = _.noop;

    var open = function(onsuccess, onfailed) {
      onAuthSuccess = onsuccess;
      onAuthFailed = onfailed;

      if (!store.exists('token')) {
        onAuthFailed();
      }
      var socketConfig = settings.socket;
      if (socket && socket.disconnected) {
        socket.connect();
      } else {
        socket = io.connect('http://' + socketConfig.host + ':' + socketConfig.port, {
          reconnection: false
        });
        socket.on('connect', function() {
          socket.emit('authenticate', {token: store.get('token')}, function(result) {
            if (parseInt(result, 10) === 1) {
              onAuthSuccess();
            } else {
              onAuthFailed();
            }
          });
        });
        socket.on('disconnect', onAuthFailed);
      }
    };

    function getSocket() {
      if (socket && socket.connected) {
        return socket;
      }
      console.error('bad socket', socket, socket && socket.connected);
    }

    function close() {
      if (socket) {
        socket.close();
      }
    }

    return {
      open: open,
      close: close,
      emit: function(event, data) {
        var socket_ = getSocket();
        socket_ && socket_.emit(event, data);
      },
      getResult: function(event, data) {
        return $q(function(resolve) {
          var callback = function(result) {
            resolve(result);
          };
          $q.when(getSocket()).then(function(socket) {
            if (socket) {
              if (data === undefined) {
                socket.emit(event, callback);
              } else {
                socket.emit(event, data, callback);
              }
            }
          });
        });
      },

      // User socket service api
      register: function(eventName, cb) {
        $q.when(getSocket()).then(function(socket) {
          if (socket) {
            socket.off(eventName);
            socket.on(eventName, cb || _.noop);
          }
        });
      },
      changeUserStatus: function(status) {
        this.emit('user change status', status);
      },
      userOnline: function(id) {
        this.emit('user online', id);
      },
      userOffline: function() {
        this.emit('user offline');
      },
      updateUser: function() {
        this.emit('user update');
      },
      getUser: function() {
        return this.getResult('user get');
      },

      // Room socket service api
      createRoom: function(room) {
        return this.getResult('room create', room);
      },
      updateRooms: function() {
        this.emit('update rooms');
      },
      joinRoom: function(id) {
        this.emit('join room', id);
      },
      leaveRoom: function() {
        this.emit('leave room');
      },
      sendMsg: function(msg) {
        this.emit('send message', msg);
      },
      sendRoomMsg: function(msg) {
        this.emit('send room message', msg);
      },
      readyCompete: function() {
        this.emit('ready compete');
      },
      unreadyComplate: function() {
        this.emit('unready compete');
      },
      terminateCompete: function() {
        this.emit('terminate compete');
      },
      startCompete: function() {
        this.emit('start compete');
      },
      sendMouseTrack: function(pixel) {
        this.emit('mouse track', pixel);
      },
      topicCheckOpt: function(opt) {
        this.emit('complete check topic', opt);
      },
      getTopic: function() {
        this.emit('complete get topic');
      },
      getTopicSize: function() {
        return this.getResult('topic total size');
      },
      getRoomStat: function() {
        return this.getResult('room get stat');
      },
      getRoom: function(id) {
        id = id || '';
        return this.getResult('room get', id);
      },
      saveTopic: function(topic) {
        return this.getResult('topic save', topic);
      },
      getUploadPolicy: function() {
        return this.getResult('topic get upload policy');
      },
      uploadFile: function(data) {
        return this.getResult('topic upload file', data);
      }
    };
  });
});
