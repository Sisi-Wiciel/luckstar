define([
    'angular'
], function (angular) {
    "use strict";

    angular.module('luckStar').controller('mainCtrl', function ($scope, socketSrv, messageCenter) {
        socketSrv.init();
    });

});
