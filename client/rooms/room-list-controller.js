define([
  'angular',
  'lodash',
  './room'
], function(angular, _, app) {
  'use strict';

  app.controller('roomListCtrl', function($scope, socketSrv, roomSrv, $location, authSrv) {
    $scope.rooms = [];
    $scope.curr = authSrv.getCurrentUser();
    $scope.popover = {
      title: '创建房间',
      content: ' '
    };
    socketSrv.register('updateRooms', function(rooms) {
      _.map(rooms, roomSrv.fillRoomUsers);
      $scope.rooms = rooms;
      $scope.$apply();
    });

    socketSrv.updateRooms();

    $scope.join = function(roomId) {
      $location.path('/home/rooms/' + roomId);
    };

    socketSrv.changeUserStatus('HOME_PAGE');
  });
});

