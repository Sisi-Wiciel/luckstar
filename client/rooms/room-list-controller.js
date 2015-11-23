define([
    'angular',
    './room'
], function (angular, app) {
    "use strict";

    app.controller('roomListCtrl', function ($scope, socketSrv, roomSrv, $location, authSrv, messageCenter) {
        $scope.rooms = [];
        $scope.curr = authSrv.getCurrentUser();
        $scope.popover = {
            "title": "创建房间",
            "content": " "
        };
        socketSrv.register('updateRooms', function (rooms) {
            _.map(rooms, roomSrv.fillRoomUsers);
            $scope.rooms = rooms;
            $scope.$apply();
        });

        socketSrv.updateRooms();

        $scope.join = function (roomId) {
            $location.path('/home/rooms/'+roomId);
        };

        $scope.leave = function () {
            socketSrv.leaveRoom();
            //$location.path('/home/rooms');
        };

        socketSrv.changeUserStatus("ROOMLIST_PAGE");
    });
});

