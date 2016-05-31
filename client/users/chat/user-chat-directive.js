'use strict';

require('./user-chat.css');
module.exports = function() {
  return {
    template: require('./user-chat.html'),
    scope:{
      user: '='
    },
    controller: ['$scope', 'authSrv', 'socketSrv', function($scope, authSrv, socketSrv) {
      $scope.curr = authSrv.getCurrentUser();
      $scope.messages = [];
      $scope.sendMsg = function() {
        if (!$scope.messageInput) {
          return;
        }
        var msg = $scope.messageInput;

        socketSrv.sendMsg({
          content: msg,
          to: $scope.user.id
        });

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
      //
      var scrollBottom = function() {
        var dom = $elem.find('md-content');
        dom.animate({
          scrollTop: dom[0].scrollHeight
        }, 370);
      };
      scope.$on('MessageReceivedEvent', function(event, message) {
        if(message.from.id === scope.user.id){
          scope.messages.push(message);
          scrollBottom();
        }
      });
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
