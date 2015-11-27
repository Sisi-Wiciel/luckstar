define([
        'angular',
        'lodash',
        'app',
    ],
    function (angular, _, app) {
        'use strict';

        app.directive('roomCompete', function ($timeout) {

            return {
                replace: true,
                templateUrl: "components/compete/compete.html",
                controller: function ($scope, socketSrv, authSrv) {
                    $scope.curr = authSrv.getCurrentUser();
                    $scope.records = [];
                    $scope.$on('topicVerdict', function (event, verdict) {
                        if ($scope.roomstat.maxNum > $scope.roomstat.currNum) {
                            $scope.records[$scope.roomstat.currNum] = {
                                verobj: verdict,
                                topic: $scope.topic
                            };
                        }
                    });

                    $scope.$on('roomInWait', function (event) {
                        $scope.updateRecords();
                    });

                    socketSrv.register('topicUpdate', function (topic) {
                        $scope.topic = topic;
                        $scope.$apply();
                    });

                    socketSrv.register('updateRoomStat', function (roomstat) {
                        $scope.roomstat = roomstat;

                        if (_.isEmpty($scope.records) || roomstat.id !== $scope.roomstat.id) {
                            $scope.records = _.fill(Array($scope.roomstat.maxNum), new Object());
                        }

                        $scope.records && $scope.updateRecords();

                        $scope.$apply();
                    });

                    //in case of refreshing brower
                    socketSrv.getTopic();
                    socketSrv.getRoomStat();
                },

                link: function (scope, ele, attr) {

                    scope.updateRecords = function () {
                        $timeout(function () {
                            $(ele).find('.record').removeClass("current").each(function (index) {
                                var record = scope.records[index];
                                if (!_.isEmpty(record)) {
                                    if ($(this).hasClass("passive") || $(this).hasClass("incorrect") || $(this).hasClass("correct")) {
                                        return;
                                    } else {

                                        if (!record.verobj) {
                                            scope.room.status == 1  && $(this).addClass("current");
                                        } else {
                                            if (record.verobj.user && scope.curr._id == record.verobj.user.id) {
                                                record.verobj.verdict == 1 && $(this).addClass("correct");
                                                record.verobj.verdict == 0 && $(this).addClass("incorrect");
                                            } else {
                                                $(this).addClass("passive")
                                            }
                                        }

                                    }
                                }

                            })
                        })

                    }
                }
            };
        })
    });