define([
  'angular',
  'lodash',
  'jquery',
  '../users'
], function(angular, _, $, app) {
  'use strict';

  app.controller('userSignupCtrl', function($scope, $timeout, authSrv, messageCenter) {
    $scope.avatarError = false;

    $scope.register = function(target) {
      if ($scope.avatar) {
        $scope.avatarError = false;
        target.avatar = $scope.avatar;
        authSrv.createUser(target).then(function() {
          messageCenter.notify('用户注册成功');
          $timeout($scope.login);
        });
      } else {
        $scope.avatarError = true;
      }
    };

    $scope.check = function(username) {
      return authSrv.usernameIsExisted(username).then(function(existed) {
        $scope.$broadcast('ngbs-error', existed, 'username');
      });
    };

    $scope.setAvatar = function(url) {
      $scope.avatar = url;
    };
  });
});
