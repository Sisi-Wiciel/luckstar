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

        $scope.$on('topicVerdict', function (event, verdict) {
            $scope.verdict = verdict;
        });

        socketSrv.register('updateRoom', function (room) {
            $scope.room = room;
            if(!room.admin){
                $scope.error('管理员退出房间', '房间已关闭');
                $scope.leave();
            }else{
                if(room.status == 1){
                    $timeout(function(){
                        $scope.$broadcast('eleChanged');
                    });
                }
            }

            $scope.$apply();
        });


        socketSrv.register('updateRoomMessage', function (msg) {
            $scope.message = msg;
            $scope.$apply();
        });

        $scope.sendRoomMsg = function(content){
            socketSrv.sendRoomMsg({
                from: $scope.curr,
                content: content
            });
        };

        $scope.isAdmin = function(user){
            if(!$scope.room || !$scope.room.admin){
                return false;
            }
            var adminId = $scope.room.admin.id;
            if(user){
                return adminId === user.id;
            }else{
                return adminId === $scope.curr._id;
            }
        }
        $scope.leave = function () {
            socketSrv.leaveRoom();
            $location.path('/home/rooms');
        };

        $scope.start = function(){
            socketSrv.readyCompete();
        }
    });

});
