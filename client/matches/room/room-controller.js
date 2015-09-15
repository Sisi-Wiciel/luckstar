define([
    'angular',
    'app'
], function (angular, module) {
    "use strict";

    module.controller("roomCtrl", function ($scope, room, $location, socketSrv, authSrv, $window) {
        $scope.room = room;
        if(!room){
            return ;
        }
        $scope.text = "";
        $scope.messages = [];
        $scope.curr = authSrv.getCurrentUser();

        socketSrv.joinRoom(room.id);

        socketSrv.register('updateRoom', function(room){
            $scope.room = room;
            $scope.$apply();
        });

        socketSrv.register('closeRoom', function(msg){
            socketSrv.leaveRoom();
            $window.alert("房间已关闭: " + msg);
            $location.path('/home/rooms');
        });

        socketSrv.register('updateMessage', function(msg){
            $scope.messages.push(msg);
            $scope.$apply();
        });

        $scope.sendRoomMsg = function(){
            socketSrv.sendRoomMsg($scope.curr, $scope.text);
        };

        $scope.leave = function () {
            socketSrv.leaveRoom();
            $location.path('/home/rooms');
        };
    });

});
