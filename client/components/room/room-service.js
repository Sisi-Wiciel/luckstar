/* eslint new-cap: [2, {"capIsNewExceptions": ["$.Callbacks"]}] */

define([
  'angular',
  'lodash',
  'app',
  'jquery'
], function(angular, _, app, $) {
  'use strict';

  app.service('roomSrv', function(socketSrv, authSrv) {
    var currentRoom = {};
    var roomstat = {};
    var currentUser = authSrv.getCurrentUser();
    var roomEndCompetitionCb = $.Callbacks();
    var roomStartCompetitionCb = $.Callbacks();

    var userColors = ['acdce6', 'fed5aa', '84dbc8', 'ffa3a4', 'e9cee1'];

    this.isUser = function() {
      return Boolean(_.find(currentRoom.users, 'id', currentUser.id));
    };

    this.isAdmin = function() {
      return currentRoom.admin.id === currentUser.id;
    };

    this.getRoleName = function() {
      if (this.isAdmin()) {
        return '房间管理员';
      }
      return this.isUser() ? '参赛者' : '观众';
    };

    this.joinRoom = function(id) {
      return socketSrv.getRoom(id).then(function(result) {
        this.updateCurrentRoom(result);
        socketSrv.joinRoom(id);
        return currentRoom;
      }.bind(this));
    };

    this.getUserMousePointerColor = function(id) {
      if (id) {
        var index = _.findIndex(currentRoom.users, 'id', id);
        return userColors[index];
      }
      return userColors;
    };

    this.onStartCompetition = function(cb) {
      roomStartCompetitionCb.add(cb);
    };

    this.onEndCompetition = function(cb) {
      roomEndCompetitionCb.add(cb);
    };

    this.updateCurrentRoom = function(room) {
      if (!_.isEmpty(currentRoom) && currentRoom.status !== room.status) {
        if (room.status === 0) {
          roomEndCompetitionCb.fire(room);
        }
        if (room.status === 1) {
          this.updateState();
          roomStartCompetitionCb.fire(room);
        }
      }

      if (room) {
        if (room.status === 0) {
          socketSrv.changeUserStatus('IN_ROOM');
        }

        if (room.status === 1) {
          if (this.isUser()) {
            socketSrv.changeUserStatus('IN_COMPETING');
          } else {
            socketSrv.changeUserStatus('IN_COMPETING_WATCHING');
          }
        }
      }

      _.assign(currentRoom, room);
      this.fillRoomUsers();
    };

    this.getCurrentRoom = function() {
      return currentRoom;
    };

    this.isCompeting = function() {
      return currentRoom.status === 1;
    };

    this.fillRoomUsers = function(room) {
      var room_ = room || currentRoom;
      if (!_.isEmpty(room_)) {
        if (room_.number > room_.users.length) {
          room_.users = room_.users.concat(_.fill(Array(room_.number - room_.users.length), null));
          room_.full = false;
        } else {
          room_.full = true;
        }
      }
    };

    this.getRoomStat = function() {
      if (_.isEmpty(roomstat)) {
        this.updateState();
      }
      return roomstat;
    };

    this.updateState = function() {
      socketSrv.getRoomStat().then(function(result) {
        _.assign(roomstat, result);
      });
    };
  });
});
