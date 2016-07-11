'use strict';

module.exports = ['$scope', 'authSrv', 'messageCenter', function($scope, authSrv, messageCenter) {
  $scope.err = '';
  $scope.user = {
    password: '',
    username: ''
  };
  $scope.login = function() {
    if (_.isEmpty($scope.loginForm.$error)) {
      authSrv.login(_.clone($scope.user)).then(function() {
        $scope.goto('/home');
      }, function(err) {
        messageCenter.error(err.message || err);
      });
    }
  };

  $scope.reset = function() {
    $scope.user = {
      password: '',
      username: ''
    };
  };
}];
