'use strict';

module.exports = ['$scope', 'authSrv', 'messageCenter', '$rootScope', function($scope, authSrv, messageCenter, $rootScope) {
  $scope.err = '';
  $scope.user = {
    password: '',
    username: ''
  }
  $scope.login = function() {
    if(_.isEmpty($scope.loginForm.$error)){
      authSrv.login(_.clone($scope.user)).then(function() {
        $rootScope.goto('/home');
      }, function(err) {
        messageCenter.error(err.message || err);
      });
    }
  };

  $scope.reset = function() {
    $scope.user = {
      password: '',
      username: ''
    }
  };
}];
