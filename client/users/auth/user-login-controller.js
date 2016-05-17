'use strict';

module.exports = ['$scope', 'authSrv', 'messageCenter', '$rootScope', function($scope, authSrv, messageCenter, $rootScope) {
  $scope.err = '';
  $scope.user = {
    password: '',
    username: ''
  }
  $scope.login = function() {
    if(_.isEmpty($scope.loginForm.$error)){
      console.info('no error ^_^');
      authSrv.login(_.clone($scope.user)).then(function() {
        $rootScope.goto('/home');
      }, function(err) {
        messageCenter.error(err.message || err);
      });
    }else{
      console.info('errors -_-!')
    }
  };

  $scope.reset = function() {
    $scope.user = {
      password: '',
      username: ''
    }
  };
}];
