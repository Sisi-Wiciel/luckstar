define([
  'angular'
], function(angular) {
  'use strict';
  angular.module('luckStar').controller('indexCtrl', function($scope, socketSrv, $location, messageCenter, store) {
    $scope.status = 'login';

    var params = $location.search();

    if (params.t) {
      if (params.t === 'inactive') {
        messageCenter.error('用户超时,请重新登录');
      }
      $location.url('/');
    }

    $scope.toSignup = function() {
      $scope.status = 'signup';
    };
    $scope.toLogin = function() {
      $scope.status = 'login';
    };

    //store.delete('token');
  });
});
