define([
    'angular',
    'app',
], function (angular, app) {
    "use strict";

    app.directive('matchRoom', function () {
        return {
            templateUrl: 'components/matches/multi/room.html',
            scope: {},
            controller: function ($scope, socketSrv, roomSrv) {
                $scope.rooms = [];
                $scope.popover = {
                    "title": "创建房间",
                    "content": " "
                };

                socketSrv.register('rooms', function (rooms) {
                    $scope.rooms = rooms;
                    $scope.$apply();
                })

                socketSrv.updateRooms();

                $scope.create = function(newroom){
                    var _clone = _.clone(newroom);
                    roomSrv.save(_clone).then(function (room) {
                        socketSrv.updateRooms();
                    })
                }
            },
            link: function () {

            }
        }
    });
})

