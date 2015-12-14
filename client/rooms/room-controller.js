define([
    'angular',
    './room',
    'lodash',
    'moment'
], function (angular, module, _, moment) {
    "use strict";

    module.controller("roomCtrl", function ($scope, room, $location, socketSrv, authSrv, messageCenter, roomSrv, $timeout) {

        if (!room) {
            messageCenter.notify('房间不存在或已经关闭.');
            $location.path('/home/rooms');
            return;
        }

        $scope.text = "";
        $scope.curr = authSrv.getCurrentUser();
        $scope.isUser = function () {
            return !!_.find($scope.room.users, 'id', $scope.curr._id);
        }

        $scope.getRole = function () {
            if ($scope.room.admin.id == $scope.curr._id) {
                return '房间管理员';
            } else {
                return this.isUser() ? '参赛者' : '观众';
            }
        }

        roomSrv.fillRoomUsers(room);

        $scope.room = room;

        socketSrv.joinRoom(room.id);

        $scope.leave = function () {
            socketSrv.leaveRoom();
            $location.path('/home/rooms');
        };

        $scope.$on('topicVerdict', function (event, verdict) {
            $scope.verdict = verdict;
        });

        socketSrv.register('updateRoom', function (room) {
            if (!room) {
                //room closed;
                messageCenter.notify('管理员退出房间, 房间已关闭');
                $scope.leave();
                $scope.$apply();
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
                        messageCenter.countdown([3, 2, 1, 'GO']);

                        if ($scope.isUser()) {
                            socketSrv.changeUserStatus("IN_COMPETING");
                        } else {
                            socketSrv.changeUserStatus("IN_COMPETING_WATCHING");
                        }

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

        socketSrv.changeUserStatus("IN_ROOM");

    });

});
