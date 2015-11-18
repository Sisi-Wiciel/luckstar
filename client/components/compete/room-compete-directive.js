define([
        'angular',
        'lodash',
        'app',
        'TweenMax'
    ],
    function (angular, _, app, TweenMax) {
        'use strict';

        app.directive('roomCompete', function () {

            return {
                replace: true,
                templateUrl: "components/compete/compete.html",
                controller: function ($scope, $timeout, socketSrv) {
                    $scope.statTable= false;
                    socketSrv.register('updateRoomStat', function (roomStat) {
                        $scope.roomStat = roomStat;
                        $scope.$apply();
                    });

                    socketSrv.register('topicUpdate', function (topic) {
                        $scope.topic = topic;
                        $scope.$apply();
                    });

                    $scope.$on('topicVerdict', function (event, verdict) {
                        $scope.verdict = verdict;
                    });

                    $scope.$watch('room', function (newValue, oldValue) {
                        if(newValue && oldValue && $scope.roomStat){
                            if(newValue.status == "0" && $scope.roomStat.currNum >= $scope.roomStat.maxNum ){
                                $timeout(function(){
                                    $scope.topic = null;
                                    $scope.setScoreBarWidth();
                                });
                            }
                        }
                    });

                    $scope.switchStatTable = function(){
                        $scope.statTable = !$scope.statTable;
                        if(!$scope.statTable){
                            $timeout($scope.setScoreBarWidth);
                        }
                    }

                    //in case of refreshing brower
                    socketSrv.getTopic();
                    socketSrv.getRoomStat();

                },
                link: function (scope, elem, attr) {
                    scope.setScoreBarWidth = function () {
                        if (scope.roomStat) {
                            elem.find(".statistic .bar").each(function (index) {
                                $(this).width(scope.roomStat.users[index].point+10);
                            })
                        }
                    }
                }
            };
        })
    });