define([
  'angular',
  'app',
  'jquery'
], function(angular, app, $) {
  'use strict';

  app.directive('userChat', function() {
    return {
      templateUrl: 'components/chat/user-chat.html',
      replace: true,
      scope: {
        messages: '=',
        sender: '&'
      },
      controller: function($scope, $timeout, authSrv) {
        $scope.curr = authSrv.getCurrentUser();

        $scope.sendMsg = function() {
          if (!$scope.messageInput) {
            return;
          }
          var msg = $scope.messageInput;

          $scope.sender({msg: msg});

          $scope.messages.push({
            content: msg,
            time: new Date(),
            system: false,
            from: $scope.curr
          });
          $scope.messageInput = '';
        };
      },
      link: function(scope, ele) {
        var $elem = $(ele);

        var scrollBottom = function() {
          var dom = $elem.find('ul');
          dom.animate({
            scrollTop: dom[0].scrollHeight
          }, 100);
        };

        scope.$watch('messages', function() {
          scrollBottom();
        });

        scope.send = function() {
          scope.sendMsg();
          scrollBottom();
        };

        $elem.find('input').on('keydown', function(event) {
          if (event.keyCode === 13) {
            scope.sendMsg();
            scrollBottom();
            scope.$apply();
          }
        });
      }
    };
  });
});
