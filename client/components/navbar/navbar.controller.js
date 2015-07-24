define([
  'angular',
  'app'
], function (angular, app) {
  'use strict';

  app.controller('NavbarCtrl', function ($scope, $location, authSrv) {
    $scope.menu = [{
      'title': '答题',
      'link': '/home/match'
    }, {
      'title': '贡献题目',
      'link': '/home/topic'
    }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = authSrv.isLoggedIn;
    $scope.getCurrentUser = authSrv.getCurrentUser;

    $scope.logout = function () {
      authSrv.logout();
      $location.path('/login');
    };

    $scope.isActive = function (route) {
      return route === $location.path();
    };
  });
})
