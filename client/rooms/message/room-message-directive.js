define([
    'angular',
    'app'
], function (angular, app) {
    "use strict";

    app.directive('roomMessage', function () {

        return {
            templateUrl: 'rooms/message/room-message.html',
            controller: function ($scope, $timeout, socketSrv, authSrv) {
                $scope.messages = [];

                socketSrv.register('updateRoomMessage', function (msg) {
                    $scope.messages.push(msg);
                    $scope.scrollBottom();
                    $scope.$apply();
                });


                var curr = authSrv.getCurrentUser();
                $scope.sendMessage = function(content){
                    socketSrv.sendRoomMsg({
                        from: curr.username,
                        content: content
                    });
                }
            },
            link: function (scope, ele) {
                var $elem = $(ele);
                scope.scrollBottom = function () {

                    var dom = $elem.find('ul');
                    dom.animate({
                        scrollTop: dom[0].scrollHeight
                    }, 100);

                };

                $elem.find("input").on('keydown', function (event) {
                    if(scope.messageInput && scope.messageInput.length > 0){
                        if (event.keyCode == 13) {
                            scope.sendMessage(scope.messageInput);
                            scope.scrollBottom();
                            scope.messageInput = "";
                            scope.$apply();
                        }
                    }

                })
            }
        }
    });
});
