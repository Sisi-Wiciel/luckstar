define([
  'angular',
  './room',
  'lodash'
], function(angular, module, _) {
  'use strict';

  module.controller('roomCtrl', function($scope, $location, socketSrv, authSrv, messageCenter, roomSrv, navbarSrv,
                                         $stateParams, $timeout) {
    $scope.text = '';
    $scope.curr = authSrv.getCurrentUser();
    $scope.room = roomSrv.getCurrentRoom();

    $scope.isUser = roomSrv.isUser;

    $scope.isAdmin = roomSrv.isAdmin;

    $scope.getRoleName = roomSrv.getRoleName;

    $scope.roomstat = {};

    $scope.updateRoomstat = function() {
      socketSrv.getRoomStat().then(function(result) {
        _.assign($scope.roomstat, result);
      });
    };

    $scope.leave = function() {
      socketSrv.leaveRoom();
    };

    $scope.$on('topicVerdict', function(event, verdict) {
      $scope.verdict = verdict;
      $scope.updateRoomstat();
    });

    socketSrv.register('updateRoom', function(room) {
      roomSrv.updateCurrentRoom(room);
      if (_.isEmpty(room)) {

        if (!$scope.isAdmin()) {
          messageCenter.notify('房间不存在或已经关闭.');
        }
        navbarSrv.removeItem('我的房间');
        $location.path('/home');

        socketSrv.unregister('updateRoom');
        $scope.$apply();
        return;
      }

      $scope.updateRoomstat();
      $scope.$apply();
    });

    roomSrv.joinRoom($stateParams.id);
    navbarSrv.addItem('我的房间', $location.path());
  });
});
