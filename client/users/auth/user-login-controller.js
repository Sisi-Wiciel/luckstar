'use strict';

require('./user-signup.css');

module.exports = ['$scope', 'authSrv', 'messageCenter', '$rootScope', function($scope, authSrv, messageCenter, $rootScope) {
  $scope.err = '';
  $scope.login = function(user) {
    authSrv.login(user).then(function() {
      $rootScope.goto('/home');
    }, function(err) {
      messageCenter.error(err.message || err);
    });
  };
}];
