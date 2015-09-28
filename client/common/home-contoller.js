define([
    'angular',
], function (angular) {
    "use strict";

    angular.module('luckStar').controller('homeCtrl', function ($scope, socketSrv) {
        socketSrv.init();
    });

})
