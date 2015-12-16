define([
    'angular',
    'lodash',
    '../users'
], function (angular, _, app) {
    "use strict";

    app.directive('userSignup', function () {

        return {
            templateUrl: 'users/auth/signup.html',
            controller: function ($scope, $timeout, authSrv) {
                $scope.avatarError = false;

                $scope.register = function (target) {
                    if (!$scope.avatar) {
                        $scope.avatarError = true;
                    } else {
                        $scope.avatarError = false;
                        target.avatar = $scope.avatar;
                        authSrv.createUser(target).then(function () {
                            messageCenter.notify("用户注册成功");
                            $timeout($scope.login)
                        });
                    }

                }

                $scope.check = function (username) {
                    return authSrv.usernameIsExisted (username).then(function (existed) {
                        $scope.$broadcast('ngbs-error', existed, 'username');
                    })
                }

                $scope.setAvatar = function (url) {
                    $scope.avatar = url;
                }
            },
            link: function (scope, ele) {
                var $usernameNode = $(ele).find("input[name='username']");
                var $loadingParentNode = $usernameNode.parent();

                var startLoading = function () {
                    $loadingParentNode.append($('<i class="fa fa-spinner loading"></i>'));
                }

                var endLoading = function () {
                    $loadingParentNode.find(".loading").remove();
                }
                $usernameNode.on('blur', function(){

                    var usernameVal = $(this).val();
                    if(usernameVal && !_.isEmpty(usernameVal)){
                        startLoading();
                        scope.check(usernameVal).finally(endLoading);
                    }

                })


            }
        }
    });
});
