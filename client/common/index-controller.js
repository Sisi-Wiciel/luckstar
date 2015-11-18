define([
    'angular',
], function (angular) {
    "use strict";
    angular.module('luckStar').controller('indexCtrl', function ($scope, socketSrv) {
        $scope.status = "login";
        $scope.register = function () {
            $scope.status = "register";
        }
        $scope.login = function () {
            $scope.status = "login";
        }

    })
});