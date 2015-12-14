define([
    'angular'
], function (angular) {
    "use strict";

    angular.module('luckStar').controller('roomCreationCtrl', function ($scope, socketSrv, messageCenter, $location) {
        $scope.numbers = [
            {'value': '1', 'label': '单人答题'},
            {'value': '2', 'label': '2人对战'},
            {'value': '3', 'label': '3人对战'},
            {'value': '4', 'label': '4人对战'},
            {'value': '5', 'label': '5人对战'},
        ]

        $scope.newroom = {
            mode: 0,
            title: "",
            number: $scope.numbers[0].value
        }

        $scope.create = function (newroom) {
            socketSrv.createRoom(_.clone(newroom), function(room){
                messageCenter.notify('房间'+newroom.title+'创建成功');
                $location.path('/home/rooms/'+room.id);
            })
        };
    });

});
