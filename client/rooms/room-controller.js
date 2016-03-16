define([
  'angular',
  './room',
  'lodash'
], function(angular, module, _) {
  'use strict';

  module.controller('roomCtrl', function($scope, $location, socketSrv, authSrv, messageCenter, roomSrv, navbarSrv,
                                         $stateParams) {
    $scope.text = '';
    $scope.curr = authSrv.getCurrentUser();
    $scope.room = roomSrv.getCurrentRoom();

    $scope.isUser = roomSrv.isUser;

    $scope.isAdmin = roomSrv.isAdmin;

    $scope.getRoleName = roomSrv.getRoleName;

    $scope.roomstat = {};

    $scope.updateRoomstat = function() {
      socketSrv.getRoomStat().then(function(result) {
        console.info(result);
        _.assign($scope.roomstat, result);
      });
    }

    function do_leave(){
      navbarSrv.removeItem('我的房间');
      $location.path('/home');
    }

    $scope.leave = function() {
      socketSrv.leaveRoom();
      do_leave();
    };

    $scope.$on('topicVerdict', function(event, verdict) {
      $scope.verdict = verdict;
      $scope.updateRoomstat();
    });

    socketSrv.register('updateRoom', function(room) {
      roomSrv.updateCurrentRoom(room);
      if (_.isEmpty(room)) {
        if (!$scope.isAdmin()) {
          messageCenter.error('房间不存在或已经关闭.');
        }
        do_leave();
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
