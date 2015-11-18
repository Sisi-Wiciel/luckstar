define([
    'angular',
    '../users'
], function (angular, module) {
    "use strict";

    module.controller('signupCtrl', function ($scope, authSrv, messageCenter, $timeout) {
        $scope.avatarError = false;

        $scope.signup = function (target) {
            if (!$scope.avatar) {
                $scope.avatarError = true;
            }else{
                $scope.avatarError = false;
                target.avatar = $scope.avatar;
                authSrv.createUser(target).then(function(){
                    messageCenter.system("用户注册成功");
                    $timeout($scope.login)
                });
            }

        }

        $scope.setAvatar = function (url) {
            $scope.avatar = url;
        }

    });
});
