define([
    'angular',
], function (angular) {
    "use strict";
    angular.module('luckStar').controller('homeCtrl', function ($scope, socketSrv) {
        socketSrv.changeUserStatus("HOME_PAGE");

    })
});