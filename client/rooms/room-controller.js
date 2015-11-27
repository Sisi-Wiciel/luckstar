define([
    'angular',
    './room',
    'lodash',
    'moment'
], function (angular, module, _, moment) {
    "use strict";

    module.controller("roomCtrl", function ($scope, room, $location, socketSrv, authSrv, messageCenter, roomSrv) {

        $scope.message = "";

        if (!room) {
            messageCenter.notify('房间不存在或已经关闭.');
            $location.path('/home/rooms');
            return;
        }

        $scope.text = "";
        $scope.curr = authSrv.getCurrentUser();

        roomSrv.fillRoomUsers(room);

        $scope.room = room;

        socketSrv.joinRoom(room.id);

        $scope.$on('topicVerdict', function (event, verdict) {
            $scope.verdict = verdict;
        });
        socketSrv.register('closeRoom', function (room) {
            messageCenter.notify('管理员退出房间, 房间已关闭');
            $scope.leave();
            $scope.$apply();
        });

        socketSrv.register('updateRoom', function (room) {
            if(!room){
                //room closed;
                return;
            }

            if ($scope.room.status == 0 && room.status == 1) {
                socketSrv.startCompete();
            }

            if($scope.room){
                if($scope.room.status != room.status){
                    room.status == 0  && socketSrv.changeUserStatus("IN_ROOM");
                    room.status == 1 && socketSrv.changeUserStatus("IN_COMPETING");
                }

                if(room.status == 0){
                    $scope.$broadcast('roomInWait');
                }
            }

            roomSrv.fillRoomUsers(room);

            $scope.room = room;

            $scope.$apply();
        });

        socketSrv.register('updateRoomMessage', function (msg) {
            $scope.message = msg;
            $scope.$apply();
        });

        $scope.sendRoomMsg = function (content) {
            socketSrv.sendRoomMsg({
                from: $scope.curr,
                content: content
            });
        };

        $scope.isRoomAdmin = function (user) {
            if (!$scope.room || !$scope.room.admin) {
                return false;
            }
            var adminId = $scope.room.admin.id;
            if (user === undefined) {
                return adminId === $scope.curr._id;
            } else {
                if(user){
                    return adminId === user.id;
                }else{
                    return false;
                }

            }
        };
        $scope.leave = function () {
            socketSrv.leaveRoom();
            $location.path('/home/rooms');
        };

        $scope.startComplate = function () {
            socketSrv.readyCompete();
        }

        $scope.terminateComplate = function(){
            socketSrv.terminateCompete();
        }

        socketSrv.changeUserStatus("IN_ROOM");

    });

});
