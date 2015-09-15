define([
    'angular',
    'lodash'
], function (angular, _) {
    "use strict";

    var matches = angular.module('luckStar.matches', []);

    matches.config(function ($stateProvider) {
        $stateProvider.state('home.match', {
            url: '/home/match',
            templateUrl: '/matches/match.html',
            controller: 'matchCtrl',
        }).state('home.rooms', {
            url: '/home/rooms',
            templateUrl: '/matches/room/room-list.html',
            controller: 'roomListCtrl',
        }).state('home.room', {
            url: '/home/room/:id',
            templateUrl: '/matches/room/room.html',
            controller: 'roomCtrl',
            resolve: {
                room: function (roomSrv, $stateParams, $location, $window) {
                    return roomSrv.get($stateParams.id).then(function (room) {
                        return room;
                    }, function(){
                        $window.alert('房间不存在');
                        $location.path('/home/rooms');
                    });
                }
            },

        });

    });
    return matches;
});
