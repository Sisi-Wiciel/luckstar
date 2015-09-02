define([
    'angular',
    'app',
], function (angular, app) {
    "use strict";

    app.directive('matchRoom', function () {
        return {
            templateUrl: 'components/matches/multi/room.html',
            scope: {},
            controller: function ($scope, socketSrv, roomSrv, $window, authSrv) {
                $scope.rooms = [];
                $scope.curr = authSrv.getCurrentUser();
                $scope.popover = {
                    "title": "创建房间",
                    "content": " "
                };

                socketSrv.register('rooms', function (rooms) {
                    $scope.rooms = rooms;
                    $scope.$apply();
                })

                socketSrv.updateRooms();

                $scope.join = function(roomId){
                    socketSrv.joinRoom(roomId);
                    $window.alert('加入成功');
                };
                $scope.leave = function(roomId){
                    socketSrv.leaveRoom(roomId);
                    $window.alert('离开成功');
                };

                $scope.create = function(newroom){
                    var _clone = _.clone(newroom);
                    roomSrv.save(_clone).then(function (room) {
                        $window.alert('创建成功');
                        socketSrv.updateRooms();
                    })
                }
            },
            link: function (scope) {
                scope.inRoom = function(users){
                    return _.find(users, 'id', scope.curr._id);
                }

            }
        }
    });
})

