define([
    'angular',
    '../room'
], function (angular, room) {
    "use strict";

    room.directive('roomHeader', function ($timeout, $interval) {

        return {
            replace: true,
            templateUrl: '/rooms/header/room-header.html',
            link: function (scope, ele) {
                scope.reorder = function () {
                    $timeout(function () {
                        var orderedUserList = _.sortByOrder(scope.room.users, 'gpoint', false);
                        var $el = $(ele);
                        $el.find('.user').each(function (index, user) {
                            var $user = $(user);

                            var newIndex = _.findIndex(orderedUserList, 'id', $user.data("userid"));
                            var newLeft = (newIndex > -1 ? newIndex : index) * 120;
                            if (newLeft != parseInt($user.css('left'))) {

                                $user.css({
                                    'left': newLeft
                                })
                            }

                        });
                    });
                }
                scope.reorder();
            },
            controller: function ($scope, $q, messageCenter, authSrv, socketSrv) {
                $scope.curr = authSrv.getCurrentUser();


                $scope.$on("roomStatus", function (event) {

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
                            var roomUser = _.find($scope.room.users, 'id', verdictUserId);

                            roomUser.gpoint = statUser.point;
                        } else {
                            _.each($scope.room.users, function (user) {
                                if (user) {
                                    if ($scope.roomstat && $scope.roomstat.users) {
                                        user.gpoint = _.find($scope.roomstat.users, 'userid', user.id).point;
                                    }
                                }
                            });
                        }
                        $scope.reorder();

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
                        messageCenter.alert("用户 " + _.map(notReadyUsers, 'username').join(",") + " 未准备.");
                        return $q.reject();
                    }

                    socketSrv.startCompete();

                }

                $scope.isReady = function (userid) {
                    return _.includes($scope.room.readyUsers, userid || $scope.curr.id);
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
