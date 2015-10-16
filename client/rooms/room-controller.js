define([
    'angular',
    './room',
    'lodash',
    'moment'
], function (angular, module, _, moment) {
    "use strict";

    module.controller("roomCtrl", function ($scope, room, $location, socketSrv, authSrv, $timeout) {
        $scope.room = room;
        $scope.message = "";
        if (!room) {
            $scope.error('房间不存在或已经被关闭.');
            $location.path('/home/rooms');
            return;
        }

        $scope.text = "";
        $scope.curr = authSrv.getCurrentUser();

        socketSrv.joinRoom(room.id);

        $scope.setVerdict = function(verdict){
            $scope.verdict = verdict;
        }

        socketSrv.register('closeRoom', function (room) {
            $scope.error('管理员退出房间', '房间已关闭');
            $scope.leave();
            $scope.$apply();
        });

        socketSrv.register('updateRoom', function (room) {

            if (($scope.room.status == 0 || $scope.room.status == 2) && room.status == 1) {
                socketSrv.startCompete();
                //$timeout(function () {
                //    $scope.$broadcast('eleChanged');
                //});
            }
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

        $scope.isAdmin = function (user) {
            if (!$scope.room || !$scope.room.admin) {
                return false;
            }
            var adminId = $scope.room.admin.id;
            if (user) {
                return adminId === user.id;
            } else {
                return adminId === $scope.curr._id;
            }
        }
        $scope.leave = function () {
            socketSrv.leaveRoom();
            $location.path('/home/rooms');
        };

        $scope.start = function () {
            socketSrv.readyCompete();
        }
    });

});
