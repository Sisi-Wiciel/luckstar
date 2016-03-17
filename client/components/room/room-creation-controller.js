define([
  'angular',
  'lodash'
], function(angular, _) {
  'use strict';

  angular.module('luckStar').controller('roomCreationCtrl', function($scope, $location, socketSrv,
                                                                     messageCenter) {
    $scope.numbers = [
      {value: '1', label: '单人答题'},
      {value: '2', label: '2人对战'},
      {value: '3', label: '3人对战'},
      {value: '4', label: '4人对战'},
      {value: '5', label: '5人对战'}
    ];

    $scope.newroom = {
      mode: 0,
      title: '',
      number: $scope.numbers[0].value
    };

    $scope.create = function() {
      if (_.isEmpty($scope.newroom.title)) {
        messageCenter.error("请填写房间名");
        return;
      }

      socketSrv.createRoom(_.clone($scope.newroom)).then(function(message) {

        if (message.id) {
          messageCenter.notify('房间' + $scope.newroom.title + '创建成功');
          $scope.join(message.id);
        }
        if (message.error === 'ALREADY_IN_ROOM') {
          messageCenter.confirm({
            title: '创建提示',
            content: '不可以同时进入多个房间中, 是否需要退出之前的房间.'
          }).then(function() {
            socketSrv.leaveRoom();
            $scope.create();
          });
        }
      });
    };
  });
});
