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

                    $scope.$on('roomStatus', function (event, room) {
                        //Cleaning resource when room closed.
                        if (room.status == 0) {
                            $scope.topic = null;
                        }

                        if (room.status == 1) {
                            //Reset records on new competition started
                            $scope.records = [];
                        }

                        $scope.updateRecords();
                    });

                    socketSrv.register('topicUpdate', function (topic) {
                        //just for animation
                        $scope.topic = null;
                        $timeout(function(){
                            $scope.topic = topic;
                            $scope.$broadcast('checkable', !!_.find($scope.room.users, 'id', $scope.curr._id));
                        });


                        $scope.$apply();
                    });

                    $scope.$on('updateRoomStats', function (event, roomstat) {
                        if (_.isEmpty($scope.records)) {
                            //Fix F5 issue
                            $scope.records = _.fill(Array($scope.roomstat.maxNum), new Object());
                        }

                        $scope.records && $scope.updateRecords();
                    });

                    //Fix F5 issue
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
                                            scope.room.status == 1 && $(this).addClass("current");
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