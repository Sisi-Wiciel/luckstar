define([
        'angular',
        'lodash',
        'app',
    ],
    function (angular, _, app) {
        'use strict';

        app.directive('competeStatistic', function ($timeout) {

            return {
                scope: {
                    room: "=",
                    roomstat: "="
                },
                templateUrl: "components/compete/statistic/statistic.html",
                controller: function ($scope, socketSrv) {
                    $scope.statTable = false;

                    $scope.$on('roomInWait', function (event) {
                        $scope.roomstat && $scope.setScorebarWidth();
                    });


                    $scope.switchStatTable = function () {
                        $scope.statTable = !$scope.statTable;
                        $scope.statTable || $scope.setScorebarWidth();
                    }

                },
                link: function (scope, elem, attr) {

                    scope.setScorebarWidth = function () {
                        $timeout(function(){
                            var _stat = scope.roomstat;
                            if (_stat) {
                                elem.find(".statistic .progress>.progress-bar").each(function (index) {
                                    $(this).width(_stat.users[index].point / _stat.maxNum * 10 + "%");
                                })

                                $timeout(function () {
                                    elem.find(".statistic .progress>.progress-bar").removeClass('active')
                                }, 2000);
                            }
                        })

                    }
                }
            };
        })
    });