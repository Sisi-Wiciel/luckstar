define([
  'angular',
  'app'
], function(angular, app) {
  'use strict';

  app.controller('NavbarCtrl', function($scope, $location, socketSrv, authSrv, navbarSrv) {
    $scope.menu = navbarSrv.menu;

    $scope.user = authSrv.getCurrentUser();

    $scope.isCollapsed = true;

    $scope.logout = function() {
      authSrv.logout();
      $location.path('/login');
    };

    $scope.goto = function(item) {
      $location.path(item.link);
    };

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
});
