define([
  'angular',
  '../users'
], function (angular, module) {
  "use strict";

  module.controller('loginCtrl', function ($scope, $location, authSrv) {
    $scope.login = function(user){

      authSrv.login(user).then(function(){
        $location.path('/home');
      }, function(err){
        alert(err.message);
      });
    }
  });
});
