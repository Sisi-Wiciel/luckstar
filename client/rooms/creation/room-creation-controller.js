'use strict';

require('./room-creation.less');

module.exports = roomCreationCtrl;

/* @ngInject */
function roomCreationCtrl($scope, socketSrv,
                          messageCenter, $timeout,
                          $mdDialog) {
  $scope.reset = function() {
    $scope.newroom = {
      title: '',
      number: 5,
      observable: 1
    };
  };

  $scope.close = function() {
    $mdDialog.cancel();
    $scope.reset();
  };
  $scope.save = function() {
    if (_.isEmpty($scope.newroom.title)) {
      messageCenter.error('请填写房间名');
      return;
    }

    socketSrv.createRoom(_.clone($scope.newroom)).then(function(message) {
      if (message.id) {
        messageCenter.notify('房间' + $scope.newroom.title + '创建成功');
        $scope.close();
        $scope.join(message.id);
      }
      if (message.error === 'ALREADY_IN_ROOM') {
        messageCenter.confirm('不可以同时进入多个房间中, 是否需要退出之前的房间.').then(function() {
          socketSrv.leaveRoom();
          $timeout($scope.save, 800);
        });
      }
    });
  };

  $scope.reset();
}
