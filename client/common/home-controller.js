define([
  'angular'
], function(angular) {
  'use strict';
  angular.module('luckStar').controller('homeCtrl', function($scope, socketSrv, authSrv, messageCenter, $location) {
    socketSrv.changeUserStatus('HOME_PAGE');

    socketSrv.register('inviteUser', function(result) {
      messageCenter.confirm("用户"+result.user+'向你发出答题邀请.').then(function() {
        $location.path('/home/rooms/' + result.room);
      });
    });

    socketSrv.register('updateUser', function(user) {
      $scope.$apply(function() {
        authSrv.updateCurrentUser(user);
      });
    });
  });
});
