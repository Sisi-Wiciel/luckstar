define([
    'angular',
], function (angular) {
    "use strict";
    angular.module('luckStar').controller('indexCtrl', function ($scope, socketSrv) {
        $scope.status = "login";
        $scope.toSignup = function () {
            $scope.status = "signup";
        }
        $scope.toLogin = function () {
            $scope.status = "login";
        }

    })
});