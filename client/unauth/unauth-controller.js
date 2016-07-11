'use strict';
module.exports = ['$scope', '$location', 'messageCenter', function($scope, $location, messageCenter) {
  $scope.status = 'login';
  var params = $location.search();

  if (params.t) {
    if (params.t === 'inactive') {
      messageCenter.error('用户超时,请重新登录');
    }
    $location.url('/');
  }

  $scope.toSignup = function() {
    $scope.status = 'signup';
  };
  $scope.toLogin = function() {
    $scope.status = 'login';
  };
  // store.delete('token');
}];

