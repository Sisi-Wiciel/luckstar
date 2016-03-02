define([
  'angular'
], function(angular) {
  'use strict';
  angular.module('luckStar').controller('homeCtrl', function($scope, socketSrv, authSrv) {
    socketSrv.changeUserStatus('HOME_PAGE');

    socketSrv.register('updateUser', function(user) {
      $scope.$apply(function() {
        authSrv.updateCurrentUser(user);
      });
    });
  });
});
