define([
  'angular',
  '../users'
], function (angular, module) {
  "use strict";

  module.controller('loginCtrl', function ($scope, $location, authSrv, $window) {

    $scope.login = function(user){

      authSrv.login(user).then(function(){
        $location.path('/home');
      }, function(err){
        $window.alert(err.message);
      });
    }
  });
});
