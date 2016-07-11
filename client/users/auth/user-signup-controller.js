'use strict';

module.exports = ['$scope', '$timeout', 'authSrv', 'messageCenter', function($scope, $timeout, authSrv, messageCenter) {
  var BASEURL = 'libs/images/avatar/';
  var SUFFIX = '.png';

  $scope.avatarArray = [];

  _.times(12, function(value) {
    var index = value + 1;
    $scope.avatarArray.push(BASEURL + index + SUFFIX);
  });

  $scope.register = function() {
    var target = _.clone($scope.user);
    if ($scope.avatar) {
      target.avatar = $scope.avatar;
      authSrv.createUser(target).then(function() {
        messageCenter.notify('用户注册成功');
        $timeout($scope.toLogin(), 1000);
      }, function(data) {
        messageCenter.error(data.message);
      });
    }
  };

  $scope.reset = function() {
    $scope.user = {
      email: '',
      username: '',
      password: ''
    };
    $scope.avatar = '';
  };

  $scope.setAvatar = function(url) {
    $scope.avatar = url;
  };
  $scope.reset();
}];
