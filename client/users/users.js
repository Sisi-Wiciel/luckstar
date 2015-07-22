define([
  'angular'
], function (angular) {
  "use strict";

  var users = angular.module('luckStar.users', []);

  return users.config(function ($routeProvider) {
    $routeProvider.when('/signup', {
      templateUrl: 'users/auth/signup.html',
      controller: 'signupCtrl'
    });

    $routeProvider.when('/login', {
      templateUrl: 'users/auth/login.html',
      controller: 'loginCtrl'
    });

  });
});
