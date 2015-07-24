define([
  'angular',
], function(angular){
  "use strict";

  angular.module('luckStar').controller('indexCtrl', function($scope){
    $scope.page = 'users/auth/login.html';
    $scope.login = function(){
      $scope.page = 'users/auth/login.html';
    };

    $scope.signup = function () {
      $scope.page = 'users/auth/signup.html';
    };

  });

})
