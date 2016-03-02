define([
  'angular',
  './room',
  'lodash'
], function(angular, module, _){
  'use strict';

  module.controller('roomCtrl', function($scope, $location, socketSrv, authSrv, messageCenter, roomSrv, navbarSrv,
                                         $stateParams){
    $scope.text = '';
    $scope.curr = authSrv.getCurrentUser();
    $scope.room = roomSrv.getCurrentRoom();

    $scope.isUser = roomSrv.isUser;

    $scope.isAdmin = roomSrv.isAdmin;

    $scope.getRoleName = roomSrv.getRoleName;

    $scope.leave = function(){
      navbarSrv.removeItem('我的房间');
      socketSrv.leaveRoom();
      $location.path('/home');
    };

    $scope.$on('topicVerdict', function(event, verdict){
      $scope.verdict = verdict;
    });

    socketSrv.register('updateRoom', function(room){
      if (_.isEmpty(room)) {
        // room closed;
        if (!$scope.isAdmin()) {
          messageCenter.error('房间不存在或已经关闭.');
        }
        $scope.leave();
        $scope.$apply();
        return;
      }

      roomSrv.updateCurrentRoom(room);

      $scope.$apply();
    });

    //socketSrv.register('updateRoomStat', function(roomstat) {
    //  if (roomstat) {
    //    $scope.roomstat = roomstat;
    //    $scope.$broadcast('updateRoomStats', roomstat);
    //  }
    //  $scope.$apply();
    //});

    roomSrv.joinRoom($stateParams.id);

    navbarSrv.addItem('我的房间', $location.path());
  });
});
