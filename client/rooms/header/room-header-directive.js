define([
    'angular',
    '../room'
], function (angular, room) {
    "use strict";

    room.directive('roomHeader', function () {

        return {
            replace: true,
            templateUrl: '/rooms/header/room-header.html',
            link: function (scope, ele) {
            },
            controller: function ($scope, $timeout, $q, messageCenter, authSrv, socketSrv) {
                $scope.curr = authSrv.getCurrentUser();
                $scope.reorder = false;
                var reorderUser = function () {
                    var preOrderList = $scope.room.users;
                    var postOrderList = _.sortByOrder($scope.room.users, 'gpoint', false);
                    if (preOrderList == postOrderList) {
                        console.info("equal");
                    } else {
                        console.info("not equal");
                    }

                    //$scope.room.users = _.sortByOrder(, 'gpoint', false);
                }

                $scope.$on("roomStatus", function (event) {
                    console.info("roomStatus")
                    if ($scope.room.status == 1) {
                        _.each($scope.room.users, function (user) {
                            user.gpoint = 0;
                        });
                    }
                })
                $scope.$on('updateRoomStats', function (event) {

                    if ($scope.roomstat.users) {

                        if ($scope.verdict && $scope.verdict.user) {
                            var verdictUserId = $scope.verdict.user.id;

                            var statUser = _.find($scope.roomstat.users, 'userid', verdictUserId);

                            _.find($scope.room.users, 'id', verdictUserId).gpoint = statUser.point;

                        }else{
                            _.each($scope.room.users, function (user) {
                                if (user) {
                                    if ($scope.roomstat && $scope.roomstat.users) {
                                        user.gpoint = _.find($scope.roomstat.users, 'userid', user.id).point;
                                    }
                                }
                            });
                        }

                    }
                });

                $scope.start = function () {
                    //$q.reject() 用户reload btn loading文字
                    if (_.filter($scope.room.users).length != $scope.room.number) {
                        messageCenter.alert("答题人数不符合要求: 需要" + $scope.room.number + "人.");
                        return $q.reject();
                    }
                    if (_.isEmpty($scope.room.readyUsers)) {
                        messageCenter.alert("用户准备就绪后,才可以开始");
                        return $q.reject();
                    }
                    var notReadyUsers = _.filter($scope.room.users, function (user) {
                        return !_.includes($scope.room.readyUsers, user.id);
                    });

                    if (!_.isEmpty(notReadyUsers)) {
                        messageCenter.alert("用户[" + _.map(notReadyUsers, 'username').join(",") + "], 尚未准备.");
                        return $q.reject();
                    }

                    socketSrv.startCompete();

                }

                $scope.isReady = function (userid) {
                    return _.includes($scope.room.readyUsers, userid || $scope.curr._id);
                }
                $scope.ready = function () {
                    socketSrv.readyCompete();
                }
                $scope.unReady = function () {
                    socketSrv.unreadyComplate();
                }
                $scope.terminate = function () {
                    socketSrv.terminateCompete();
                }
            }
        }
    });
});
