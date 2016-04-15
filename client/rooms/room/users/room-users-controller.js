'use strict';

require('./room-users.css');

module.exports = ['$scope', '$q', 'messageCenter', 'authSrv', 'socketSrv', 'roomSrv', function($scope, $q,
                                                                                               messageCenter, authSrv,
                                                                                               socketSrv, roomSrv) {
  $scope.curr = authSrv.getCurrentUser();

  var userStatusColors = {
    ONLINE: '#73e252',
    OFFLINE: '#767676',
    UNREADY: '#f88d00',
    READY: '#73e252'
  };
  $scope.userPointerColors = roomSrv.getUserMousePointerColor();

  $scope.start = function() {
    // $q.reject() 用户reload btn loading文字
    if (_.isEmpty($scope.room.readyUsers)) {
      messageCenter.error('用户准备就绪后,才可以开始');
      return $q.reject();
    }
    var notReadyUsers = _.filter($scope.room.users, function(user) {
      return user && !_.includes($scope.room.readyUsers, user.id);
    });

    if (!_.isEmpty(notReadyUsers)) {
      messageCenter.error('用户准备就绪后,才可以开始.');
      // messageCenter.error('用户 ' + _.map(notReadyUsers, 'username').join(',') + ' 未准备.');
      return $q.reject();
    }

    socketSrv.startCompete();
  };

  $scope.getUserStatusColor = function(user) {
    if (user.status === '0') {
      return userStatusColors.OFFLINE;
    }

    if (!roomSrv.isCompeting()) {
      return $scope.isReady(user.id) ? userStatusColors.READY : userStatusColors.UNREADY;
    }

    return userStatusColors.ONLINE;
  };

  $scope.getUserStatus = function(user) {
    if (user.status === '0') {
      return '离线';
    }
    if (!roomSrv.isCompeting()) {
      return $scope.isReady(user.id) ? '已准备' : '未准备';
    }

    return '在线';
  };

  $scope.isReady = function(userid) {
    return _.includes($scope.room.readyUsers, userid || $scope.curr.id);
  };
  $scope.ready = function() {
    socketSrv.readyCompete();
  };
  $scope.unReady = function() {
    socketSrv.unreadyComplate();
  };
  $scope.terminate = function() {
    socketSrv.terminateCompete();
  };
  $scope.kickOff = function(userid) {
    socketSrv.kickOff(userid);
  };
}];
