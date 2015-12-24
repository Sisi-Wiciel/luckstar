define([
        'angular',
        'lodash',
        './room',
    ],
    function (angular, _, app) {
        'use strict';

        app.controller('roomCompeteCtrl', function ($scope, $timeout, socketSrv, authSrv) {
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
            });

            socketSrv.register('topicUpdate', function (topic) {
                //just for animation
                $scope.topic = null;
                $timeout(function () {
                    $scope.topic = topic;
                    $scope.$broadcast('checkable', !!_.find($scope.room.users, 'id', $scope.curr.id));
                });

                $scope.$apply();
            });

            $scope.$on('updateRoomStats', function (event, roomstat) {
                if (_.isEmpty($scope.records)) {
                    //Fix F5 issue
                    $scope.records = _.fill(Array($scope.roomstat.maxNum), new Object());
                }
            });

            //Fix F5 issue
            socketSrv.getTopic();
            socketSrv.getRoomStat();
        });
    });
