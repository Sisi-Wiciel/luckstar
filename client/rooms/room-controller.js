define([
    'angular',
    './room',
    'lodash',
    'moment'
], function (angular, module, _, moment) {
    "use strict";

    module.controller("roomCtrl", function ($scope, room, $location, socketSrv, authSrv, messageCenter, roomSrv, $timeout) {

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
        var countdownTimes = 3;


        socketSrv.joinRoom(room.id);

        var waitForTopic = function(){
            var countdownTimes = 3;
            (function countdown() {
                $timeout(function () {
                    if (countdownTimes > 0) {
                        messageCenter._show({
                            content : '<div class="text-danger">'+countdownTimes--+'</div>',
                            animation: "competeStartupCountdown"
                        });
                        countdown();
                    } else {
                        messageCenter._show({
                            content : '<div class="text-danger">GO</div>',
                            animation: "competeStartupCountdown"
                        }, 1000);
                    }
                }, 1000);
            })();
        }

        $scope.$on('topicVerdict', function (event, verdict) {
            $scope.verdict = verdict;
        });
        socketSrv.register('closeRoom', function (room) {
            messageCenter.notify('管理员退出房间, 房间已关闭');
            $scope.leave();
            $scope.$apply();
        });

        socketSrv.register('updateRoom', function (room) {
            if (!room) {
                //room closed;
                return;
            }

            if ($scope.room) {
                if ($scope.room.status != room.status) {
                    $scope.$broadcast('roomStatus', room);
                    $scope.verdict = null;
                    if (room.status == 0) {
                        socketSrv.changeUserStatus("IN_ROOM");
                    }

                    if (room.status == 1) {
                        $scope.roomstat = null;
                        waitForTopic();
                        socketSrv.changeUserStatus("IN_COMPETING");
                    }
                }
            }

            roomSrv.fillRoomUsers(room);
            $scope.room = room;
            $scope.$apply();
        });

        socketSrv.register('updateRoomStat', function (roomstat) {
            if (roomstat) {
                $scope.roomstat = roomstat;
                $scope.$broadcast('updateRoomStats', roomstat);
            }
            $scope.$apply();
        });

        $scope.isRoomAdmin = function (user) {
            if (!$scope.room || !$scope.room.admin) {
                return false;
            }
            var adminId = $scope.room.admin.id;
            if (user === undefined) {
                return adminId === $scope.curr._id;
            } else {
                if (user) {
                    return adminId === user.id;
                } else {
                    return false;
                }

            }
        };
        $scope.leave = function () {
            socketSrv.leaveRoom();
            $location.path('/home/rooms');
        };

        socketSrv.changeUserStatus("IN_ROOM");

    });

});
