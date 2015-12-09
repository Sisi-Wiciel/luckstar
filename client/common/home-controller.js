define([
    'angular',
], function (angular) {
    "use strict";
    angular.module('luckStar').controller('homeCtrl', function ($scope, socketSrv) {
        socketSrv.changeUserStatus("HOME_PAGE");
        $scope.totalSize = 0;
        socketSrv.getTopicSize().then(function(size){
            $scope.totalSize = size;
        })
    })
});