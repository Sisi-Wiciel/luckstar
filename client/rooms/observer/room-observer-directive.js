define([
    'angular',
    '../room'
], function (angular, room) {
    "use strict";

    room.directive('roomObserver', function () {

        return {
            replace: true,
            templateUrl: '/rooms/observer/room-observer.html',
            link: function (scope, ele) {
            },
            controller: function ($scope, $timeout, $q, messageCenter, authSrv) {
            }
        }
    });
});
