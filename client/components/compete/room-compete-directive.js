define([
        'angular',
        'lodash',
        'app'
    ],
    function (angular, _, app) {
        'use strict';

        app.directive('roomCompete', function () {

            return {
                replace:true,
                templateUrl: "components/compete/compete.html",
                controller: function ($scope, Topic, socketSrv) {
                    socketSrv.register('topicVerdict', function(obj){
                        $scope.setVerdict(obj);
                        $scope.$apply();
                    });

                    socketSrv.register('updateRoomStat', function(roomStat){
                        $scope.roomStat = roomStat;
                        if(roomStat.maxNum < roomStat.currNum){
                            $scope.topic = {};
                        }
                        $scope.$apply();
                    });

                    socketSrv.register('topicUpdate', function(topic){
                        $scope.topic = new Topic(topic);
                        $scope.$apply();
                    });

                },
                link: function (scope, elem, attr) {

                }
            };
        });
    });