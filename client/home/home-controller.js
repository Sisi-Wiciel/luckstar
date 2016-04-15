'use strict';

require('./home.css');

module.exports = ['$scope', 'socketSrv', 'authSrv', 'messageCenter', '$location', function($scope, socketSrv, authSrv, messageCenter, $location) {
  socketSrv.changeUserStatus('HOME_PAGE');

  socketSrv.register('inviteUser', function(result) {
    messageCenter.confirm('用户' + result.user + '向你发出答题邀请.').then(function() {
      $location.path('/home/rooms/' + result.room);
      socketSrv.inviteUserResponse(result.userid, 1);
    }, function() {
      socketSrv.inviteUserResponse(result.userid, 0);
    });
  });

  socketSrv.register('updateUser', function(user) {
    $scope.$apply(function() {
      authSrv.updateCurrentUser(user);
    });
  });
}];
