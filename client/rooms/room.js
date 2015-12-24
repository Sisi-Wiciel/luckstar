define([
    'angular',
    'lodash'
], function (angular, _) {
    "use strict";

    var compete = angular.module('luckStar.rooms', []);

    compete.config(function ($stateProvider) {
        $stateProvider.state('home.rooms', {
            url: '/home/rooms',
            templateUrl: '/rooms/room-list.html'
        })
        .state('home.room', {
            url: '/home/rooms/:id',
            templateUrl: '/rooms/room.html',
            controller: 'roomCtrl',
            resolve: {
                room: function (roomSrv, $stateParams, $location) {
                    return roomSrv.get($stateParams.id).then(function (room) {
                        return room;
                    }, function (err) {
                        return "";
                    });
                }
            }

            })

    });
    return compete;
});
