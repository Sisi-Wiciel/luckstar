define([
  'angular'
], function (angular) {
  "use strict";

  var users = angular.module('luckStar.users', []);

  //return users.config(function ($stateProvider) {
  //  $stateProvider
  //    .state('index.signup', {
  //      url: "/signup",
  //      templateUrl: 'users/auth/signup.html',
  //      controller: 'signupCtrl'
  //    })
  //    .state('index.login', {
  //      url: '/login',
  //      templateUrl: 'users/auth/login.html',
  //      controller: 'loginCtrl'
  //  });
  //});
    return users;
});
