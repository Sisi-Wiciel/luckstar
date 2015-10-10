define([
    'angular',
    './room',
], function (angular, app) {
    "use strict";

    app.controller('roomListCtrl', function ($scope, socketSrv, roomSrv, $location, authSrv, $rootScope) {
        $scope.rooms = [];
        $scope.curr = authSrv.getCurrentUser();
        $scope.popover = {
            "title": "创建房间",
            "content": " "
        };
        socketSrv.register('updateRooms', function (rooms) {
            $scope.rooms = rooms;
            $scope.$apply();
        })

        socketSrv.updateRooms();

        $scope.join = function (roomId) {
            $location.path('/home/room/'+roomId);
        };

        $scope.create = function (newroom) {
            var _clone = _.clone(newroom);
            roomSrv.save(_clone).then(function (room) {
                $location.path('/home/room/'+room.id);
            })
        };
    });
})

