var roomService = require('./room.service');
var userService = require('../user/user.service');
var socketService = require('../socket/socket.service');
var competeSocket = require('./roomcompete.socket');
var log = require('../../log');
var _ = require('lodash');
var moment = require('moment');
var setting = require('../../config/setting');

module.exports = {
  events: {
    roomKickUserOff: roomKickUserOff,
    roomInviteUserResponse: roomInviteUserResponse,
    roomInviteUser: roomInviteUser,
    roomCreate: roomCreate,
    roomGetStat: roomGetStat,
    roomTerminateCompete: roomTerminateCompete,
    roomUpdate: updateRooms,
    roomSendMessage: sendRoomMessage,
    roomGet: getRoom,
    roomReadyCompete: roomReadyCompete,
    roomJoin: roomJoin,
    roomLeave: roomLeave,
    roomStartCompete: roomStartCompete,
    roomUnreadyCompete: roomUnreadyCompete
  },
  updateRooms: updateRooms,
  sendRoomMessage: sendRoomMessage,
  deregister: function(socket) {
    roomLeave(socket);
  }
};

function getRoom(socket, id, cb) {
  log.verbose("room.socket#getRoom", id);

  roomService.list(id).then(function(room) {
    if (room) {
      userService.list(socket.uid).then(function(user) {
        cb(room, user);
      });
    } else {
      cb(null, null);
      log.warn("GetRoom: not found room ", id);
    }
  });
}

function updateRooms(socket) {
  log.verbose("room.socket#updateRooms", socket.room);

  return roomService.list().then(function(rooms) {
    var roomId = socket.room;
    // if currRoom is null, this room is closed.
    if (!_.isEmpty(roomId)) {
      socketService.emitInAll(roomId, 'updateRoom', _.find(rooms, {"id": roomId}));
    }
    socketService.emitAll("updateRooms", rooms);
  });
}

function sendRoomMessage(socket, message) {
  log.verbose("room.socket#sendRoomMessage", socket.room);
  message.time = moment().format();
  socketService.emitInAll(socket.room, 'updateRoomMessage', message)
}

function roomLeave(socket) {
  log.verbose("room.socket#roomLeave", socket.room);
  var roomid = socket.room;
  if (_.isEmpty(socket.room)) {
    return;
  }
  /*
   function obPolicy(room, user) {
   sendRoomMessage(socket, '观众' + user.username + '离开房间, 观众' + room.obs.length - 1 + '人', true);
   return roomService.update(room, function(locked) {
   _.pull(locked.obs, user.id);
   });
   }
   */
  getRoom(socket, roomid, function(room, user) {
    var promise = roomService.leave(room, user);
    if (_.isEmpty(promise)) {
      return;
    }
    promise.then(function() {
      //Tell to all player.
      sendRoomMessage(socket, user.username + '离开房间', true);
      return updateRooms(socket)
    }).then(function() {
      socket.emit('updateRoom', null);
      socket.room = '';
      socket.leave(room);
    });
  });

}


function roomJoin(socket, id) {
  log.verbose("room.socket#roomJoin", id);
  socket.room = id;

  getRoom(socket, id, function(room, user) {

    if (_.isEmpty(room)) {
      log.verbose("Room is empty for now");
      socket.emit('updateRoom', null);
      return;
    }
    //管理员默认在room.users里面, 如果这句话放倒if中,管理员将得不到房间的消息通知.
    socket.join(socket.room);
    if (!_.find(room.users, {'id': socket.uid})) {
      roomService.join(room, user).then(function(room) {
        return userService.setRoom(socket.uid, room.id).then(function() {
          sendRoomMessage(socket, '用户' + user.username + '加入房间');
        });
      }).then(function() {
        updateRooms(socket);
      });
    } else {
      log.verbose("User already in room ", room.id);
      sendRoomMessage(socket, '用户' + user.username + '加入房间');
    }
  });
}

function roomStartCompete(socket) {
  log.verbose("room.socket#roomStartCompete");
  
  getRoom(socket, socket.room, function(room, user) {
    if (room.admin.id !== user.id) {
      socketService.emitInAll(socket.room, 'RoomAlert', '需要管理员开启比赛.');
      return;
    }
    if (room.readyUsers.length == room.users.length) {

      roomService.startCompete(room).then(function(updatedRoom) {
        updateRooms(socket);
        competeSocket.start(socket, updatedRoom);
      });

    } else {
      socketService.emitInAll(socket.room, 'RoomAlert', '需要全部用户准备就绪后才可开始');
    }

  });
}

function roomUnreadyCompete(socket) {
  log.verbose("room.socket#UnReadyRoomCompete");

  getRoom(socket, socket.room, function(room, user) {

    roomService.update(socket.room, function(locked) {
      var userIndex = locked.readyUsers.indexOf(user.id);

      if (userIndex > -1) {
        _.pullAt(locked.readyUsers, userIndex);
        socketService.emitInAll(socket.room, 'updateRoom', locked);
      } else {
        log.warn("User %s was not in ready status yet ", user.id);
      }
    }).then(function() {
      sendRoomMessage(socket, '用户' + user.username + '取消准备.');
    });
  });
}

function roomReadyCompete(socket) {
  log.verbose("room.socket#roomReadyCompete");

  getRoom(socket, socket.room, function(room, user) {

    roomService.update(socket.room, function(locked) {
      if (locked.readyUsers.indexOf(user.id) == -1) {
        locked.readyUsers.push(user.id);
        socketService.emitInAll(socket.room, 'updateRoom', locked);
      } else {
        log.warn("User %s was in ready status ", user.id);
      }
    }).then(function() {
      sendRoomMessage(socket, '用户' + user.username + '准备就绪.');
    })

  });
}

function roomTerminateCompete(socket) {
  log.verbose("room.socket#RoomTerminateCompete");

  getRoom(socket, socket.room, function(room) {
    roomService.terminateCompete(room).then(function() {
      sendRoomMessage(socket, '管理员已终止答题');
    }).then(function() {
      updateRooms(socket);
    });
  });
}

function roomGetStat(socket, cb) {
  log.verbose("room.socket#roomGetStat, " + socket.room);
  roomService.listRoomStat(socket.room).then(cb);
}

function roomCreate(socket, newroom, cb) {
  log.verbose("room.socket#roomCreate ", socket.uid, socket.room);

  function do_save() {
    roomService.save(newroom, socket.uid).then(function(room) {
      return userService.setRoom(socket.uid, room.id).then(function() {
        updateRooms(socket);
        cb(room);
      });
    });
  }

  if (socket.room) {
    roomService.list(socket.room).then(function(room) {
      if (_.isEmpty(room)) {
        socket.room = '';
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
}

function roomInviteUser(socket, userid) {
  log.verbose("room.socket#roomInviteUser");
  getRoom(socket, socket.room, function(room, me) {
    //make sure that user as a player in room
    if (_.find(room.users, {'id': me.id})) {
      userService.list(userid).then(function(user) {
        var userSocket = socketService.getSocketByUser(user);
        if (userSocket) {
          userSocket.emit('inviteUser', {
            'room': socket.room,
            'user': me.username,
            'userid': me.id
          });
        }
      });
    }
  });
}

function roomInviteUserResponse(socket, userid, response) {
  log.verbose("room.socket#roomInviteUserResponse");
  userService.list(userid).then(function(user) {
    var userSocket = socketService.getSocketByUser(user);
    userSocket.emit('inviteUserResponse', {
      response: response,
      username: user.username
    });
  });
}

function roomKickUserOff(socket, userid) {
  log.verbose("room.socket#roomKickUserOff");
  getRoom(socket, socket.room, function(room, me) {
    if (room.admin.id === me.id) {
      userService.list(userid).then(function(user) {
        roomService.leave(room, user).then(function() {
          var userSocket = socketService.getSocketByUser(user);

          if (userSocket) {
            userSocket.emit('updateRoom', null);
          }
          updateRooms(socket);
        });
      });
    } else {
      log.warn('Only room admin can kick off user.');
    }

  });
}