'use strict';

require('./user-chat.css');
module.exports = function() {
  return {
    template: require('./user-chat.html'),
    replace: true,
    scope: {
      messages: '=',
      sender: '&'
    },
    controller: ['$scope', 'authSrv', function($scope, authSrv) {
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
    }],
    link: function(scope, ele) {
      var $elem = $(ele);

      var scrollBottom = function() {
        var dom = $elem.find('ul');
        dom.animate({
          scrollTop: dom[0].scrollHeight
        }, 100);
      };

      scope.$watchCollection('messages', function() {
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
};
