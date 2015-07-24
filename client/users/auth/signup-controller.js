define([
  'angular',
  '../users'
], function(angular, module){
  "use strict";

  module.controller('signupCtrl', function($scope, $location, authSrv){
    $scope.signup = function(target){
      authSrv.createUser(target).then(function(){
        alert("注册成功");
        $location.path('/login');
      });
    }
  });
})
