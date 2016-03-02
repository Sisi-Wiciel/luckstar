define([
  'angular',
  'lodash',
  '../users'
], function(angular, _, app) {
  'use strict';

  app.controller('userLoginCtrl', function($scope, $location, authSrv, messageCenter) {
    $scope.err = '';
    $scope.login = function(user) {
      authSrv.login(user).then(function() {
        $location.path('/home');
      }, function(err) {
        messageCenter.error(err.message || err);
      });
    };
  });
});
