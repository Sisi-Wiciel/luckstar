define([
  'angular',
  'lodash',
  'jquery',
  'app'
], function(angular, _, $, app) {
  'use strict';

  app.directive('roomMessage', function() {
    return {
      templateUrl: '/components/room/message/room-message.html',
      controller: function($scope, $timeout, socketSrv, authSrv) {
        $scope.messages = [];
        var curr = authSrv.getCurrentUser();

        socketSrv.register('updateRoomMessage', function(msg) {
          if (msg) {
            if (msg.system) {
              msg.role = '[系统信息]';
            } else if (_.find($scope.room.users, 'id', msg.message.userid)) {
              msg.role = '[参赛者]';
            } else if ($scope.room.obs.indexOf(msg.message.userid) > -1) {
              msg.role = '[观众]';
            } else {
              msg.role = '[unknown]';
            }
          }

          if (msg.role) {
            $scope.messages.push(msg);
            $scope.scrollBottom();
            $scope.$apply();
          }
        }
        );

        $scope.sendMessage = function(content) {
          socketSrv.sendRoomMsg({
            username: curr.username,
            userid: curr.id,
            content: content
          });
        };
      },
      link: function(scope, ele) {
        var $elem = $(ele);
        scope.scrollBottom = function() {
          var dom = $elem.find('ul');
          dom.animate({
            scrollTop: dom[0].scrollHeight
          }, 100);
        };
        $elem.find('input').on('keydown', function(event) {
          if (scope.messageInput && scope.messageInput.length > 0) {
            if (event.keyCode === 13) {
              scope.sendMessage(scope.messageInput);
              scope.scrollBottom();
              scope.messageInput = '';
              scope.$apply();
            }
          }
        });
      }
    }
    ;
  })
  ;
})
;
