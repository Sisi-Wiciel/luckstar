define([
    'angular',
    'app'
], function (angular, app) {
    "use strict";

    app.directive('onlineList', function () {

        return {
            templateUrl: 'components/users/online-list.html',

            controller: function ($scope, $timeout, socketSrv, authSrv, $window) {
                $scope.messages = [];
                $scope.toUser = {};

                $scope.statusList = [
                    {display: '全部', value: -1, cls: 'fa-user'},
                    {display: '离线', value: 0, cls: 'fa-circle text-muted'},
                    {display: '在线', value: 1, cls: 'fa-circle text-success'},
                    {display: '繁忙', value: 2, cls: 'fa-circle text-danger'},
                ];

                $scope.status = $scope.statusList[0];
                $scope.userlist = [];

                $scope.curr = authSrv.getCurrentUser();

                socketSrv.register('updateUser', function (users) {
                    _.assign($scope.userlist, users);
                    $scope.$apply();
                });

                $scope.showChatPanel = function (to) {
                    $scope.toUser = to;
                    $scope.chatting = true;
                };

                $scope.hideChatPanel = function () {
                    $scope.chatting = false;
                    $scope.toUser = {};
                }

                socketSrv.register('updateUser', function (users) {
                    _.assign($scope.userlist, users);
                    $scope.$apply();
                });

                socketSrv.register('updateMessage', function (item) {

                    if (!$scope.messages[item.from.id]) {
                        $scope.messages[item.from.id] = [];
                    }

                    $scope.messages[item.from.id].push(item);

                    if(item.from.id !== $scope.toUser.id){
                        if ($window.confirm(item.from.username + ":" + item.content)) {
                            $scope.showChatPanel(item.from);
                        }
                    }

                    $scope.message = item;
                    $scope.$apply();
                });

                $scope.sendMsg = function(msg){
                    socketSrv.sendMsg({
                        content: msg,
                        to: $scope.toUser.id
                    });
                }
                //$scope.$on('sendMsg', function (event, msg) {
                //
                //});

                socketSrv.userOnline($scope.curr._id);
            }
        }
    });
});
