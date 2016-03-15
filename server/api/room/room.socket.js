var roomService = require('./room.service');
var userService = require('../user/user.service');
var topicService = require('../topic/topic.service');
var competeSocket = require('./compete.socket');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');
var setting = require('../../config/setting');

var updateRooms = function(socket, roomid) {
  log.verbose("room.socket#UpdateRooms", roomid);

  roomService.list().then(function(rooms) {
    roomid = roomid || socket.room;
    if (roomid) {
      var currRoom = _.find(rooms, "id", roomid);
      socket.io.sockets.in(roomid).emit('updateRoom', currRoom);
    }

    socket.io.emit("updateRooms", rooms);
  });
};

var sendRoomMessage = function(socket, message, isSystem) {
  log.verbose("room.socket#SendRoomMessage");

  socket.io.sockets.in(socket.room).emit('updateRoomMessage', {
    message: message,
    system: isSystem,
    time: moment().format()
  });
};

var getAndUpdateRoom = function(socket, id, cb) {
  log.verbose("room.socket#GetAndUpdateRoom");
  if (!cb) {
    return;
  }

  roomService.list(id).then(function(rooms) {
    if (rooms && rooms.length == 1) {
      var room = rooms[0];

      userService.list(socket.uid).get(0).then(function(user) {
        var promise_ = cb(room, user);
        promise_ && promise_.then(function() {
          updateRooms(socket, room.id);
        });
      });

    } else {
      if (socket.room === id) {
        socket.leave(id);
        socket.room = null
      }
      log.warn("getAndUpdateRoom: not found room ", id);
    }

  });
};

var joinRoom = function(socket, id) {
  log.verbose("room.socket#JoinRoom", id);
  socket.room = id;

  getAndUpdateRoom(socket, id, function(room, user) {

    //管理员默认在room.users里面, 如果这句话放倒if中,管理员将得不到房间的消息通知.
    socket.join(socket.room);

    if (!_.find(room.users, 'id', user.id)) {
      return roomService.join(room, user).then(function(room) {
        return userService.joinRoom(user, room).then(function() {
          // Check out user role
          if (_.find(room.users, 'id', user.id)) {
            sendRoomMessage(socket, '用户' + user.username + '加入房间', true);
          } else {
            sendRoomMessage(socket, '用户' + user.username + '正在观看比赛, 观众' + room.obs.length + '人', true);
          }
        });
      })
    } else {
      sendRoomMessage(socket, '用户' + user.username + '加入房间', true);
    }
  });
};

var leaveRoom = function(socket) {
  log.verbose("room.socket#LeaveRoom");
  var room = socket.room;

  var adminLeaver = function(room, user) {
    sendRoomMessage(socket, '管理员' + user.username + '离开房间', true);
    return roomService.remove(room);
  }

  var userLeaver = function(room, user) {
    sendRoomMessage(socket, '参赛者' + user.username + '离开房间', true);
    return roomService.update(room, function(locked) {
      _.remove(locked.users, 'id', user.id);
    });
  }

  var obLeaver = function(room, user) {
    sendRoomMessage(socket, '观众' + user.username + '离开房间, 观众' + room.obs.length - 1 + '人', true);
    return roomService.update(room, function(locked) {
      locked.obs.pop(user.id)
    });
  }

  getAndUpdateRoom(socket, room, function(room, user) {
    var promise = null;
    if (user.id === room.admin.id) {
      promise = adminLeaver(room, user);
    } else if (_.find(room.users, "id", user.id)) {
      promise = userLeaver(room, user);
    } else if (room.obs.indexOf(user.id) >= 0) {
      promise = obLeaver(room, user);
    }

    if (promise) {
      socket.leave(room);
      delete socket.room;
      return promise;
    }

  });
};

var startRoomCompete = function(socket) {
  log.verbose("room.socket#StartRoomCompete");
  var COUNTDOWN_MAXNUMBER = 3;
  getAndUpdateRoom(socket, socket.room, function(room, user) {
    if (room.admin.id !== user.id) {
      socket.io.sockets.in(socket.room).emit('RoomAlert', '需要管理员开启比赛.');
      return;
    }
    if (room.readyUsers.length == room.users.length) {
      roomService.createCompeteState(room).then(function(roomStat) {
        (function startCountDown(number) {
          setTimeout(function() {
            if (number > 0) {
              socket.io.sockets.in(socket.room).emit('StartCompeteCountDown', number);
              sendRoomMessage(socket, number + '秒后开始...', true);
              startCountDown(--number);
            } else {
              competeSocket.nextTopic(socket);
            }
          }, 1500);
        })(COUNTDOWN_MAXNUMBER);
      });

      return roomService.startCompete(room);
    } else {
      socket.io.sockets.in(socket.room).emit('RoomAlert', '需要全部用户准备就绪后才可开始');
    }

  });
};

var unreadyRoomCompete = function(socket) {
  log.verbose("room.socket#UnReadyRoomCompete");

  getAndUpdateRoom(socket, socket.room, function(room, user) {

    roomService.update(socket.room, function(locked) {
      var userIndex = locked.readyUsers.indexOf(user.id);

      if (userIndex > -1) {
        _.pullAt(locked.readyUsers, userIndex);
        socket.io.sockets.in(socket.room).emit('updateRoom', locked);
      } else {
        log.warn("User %s was not in ready status yet ", user.id);
      }
    }).then(function() {
      sendRoomMessage(socket, '用户' + user.username + '取消准备.', true);
    });
  });
};
var readyRoomCompete = function(socket) {
  log.verbose("room.socket#ReadyRoomCompete");

  getAndUpdateRoom(socket, socket.room, function(room, user) {

    roomService.update(socket.room, function(locked) {
      if (locked.readyUsers.indexOf(user.id) == -1) {
        locked.readyUsers.push(user.id);
        socket.io.sockets.in(socket.room).emit('updateRoom', locked);
      } else {
        log.warn("User %s was in ready status ", user.id);
      }
    }).then(function() {
      sendRoomMessage(socket, '用户' + user.username + '准备就绪.', true);
    })

  });
};
var terminateRoomCompete = function(socket) {
  log.verbose("room.socket#TerminateRoomCompete");

  getAndUpdateRoom(socket, socket.room, function(room, user) {
    return roomService.terminateCompete(room).then(function() {
      sendRoomMessage(socket, '管理员已终止答题', true);
    });
  });
};

var getRoomStat = function(socket) {
  log.verbose("room.socket#GetRoomStat, " + socket.room);
  return roomService.listRoomStat(socket.room);
};

var createRoom = function(socket, newroom, cb) {
  log.verbose("room.socket#CreateRoom, " + socket.uid);

  function do_save() {
    roomService.save(newroom, socket.uid).then(function(room) {
      return userService.joinRoom(socket.uid, room).then(function() {
        updateRooms(socket);
        cb(room);
      });
    });
  }

  if (socket.room) {
    roomService.list(socket.room).then(function(room) {
      if (_.isEmpty(room)) {
        socket.room = null;
        do_save();
      } else {
        cb({
          error: 'ALREADY_IN_ROOM'
        });
      }
    });
  } else {
    do_save();
  }
};

exports.updateRooms = updateRooms;
exports.sendRoomMessage = sendRoomMessage;

exports.register = function(socket) {
  var socketSrv = require('../socket/socket.service');

  socketSrv.on(socket, 'update rooms', function() {
    updateRooms(socket);
  });

  socketSrv.on(socket, 'join room', function(id) {
    joinRoom(socket, id);
  });

  socketSrv.on(socket, 'leave room', function() {
    leaveRoom(socket);
  });

  socketSrv.on(socket, 'send room message', function(msg) {
    sendRoomMessage(socket, msg, false);
  });

  socketSrv.on(socket, 'ready compete', function() {
    readyRoomCompete(socket);
  });
  socketSrv.on(socket, 'unready compete', function() {
    unreadyRoomCompete(socket);
  });
  socketSrv.on(socket, 'start compete', function() {
    startRoomCompete(socket);
  })
  socketSrv.on(socket, 'terminate compete', function() {
    terminateRoomCompete(socket);
  })
  socketSrv.on(socket, 'room get stat', function(cb) {
    getRoomStat(socket).then(cb);
  })
  socketSrv.on(socket, 'room get', function(id, cb) {
    id = id || socket.room;
    if (!_.isEmpty(id)) {
      roomService.list(id).then(function(rooms) {
        cb(_.first(rooms));
      });
    } else {
      cb({});
    }

  })
  socketSrv.on(socket, 'room create', function(room, cb) {
    createRoom(socket, room, cb);
  })
};

exports.deregister = function(socket) {
  leaveRoom(socket);
};
