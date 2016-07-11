'use strict';

require('./room-message.less');
module.exports = function() {
  return {
    template: require('./room-message.html'),
    controller: roomMessageCtrl,
    link: link
  };
};

function link(scope, ele) {
  var $elem = $(ele);
  scope.scrollBottom = function() {
    var messageContainer = $elem.find('md-content');
    messageContainer.animate({
      scrollTop: messageContainer[0].scrollHeight
    }, 100);
  };
  $elem.find('input').on('keydown', function(event) {
    if (scope.messageInput && scope.messageInput.length > 0) {
      if (event.keyCode === 13) {
        scope.sendMessage(scope.messageInput);
        scope.messageInput = '';
        scope.$apply();
      }
    }
  });
}

/* @ngInject */
function roomMessageCtrl($scope, $timeout, socketSrv, authSrv,
                         roomSrv) {
  $scope.messages = roomSrv.getMessage();
  var curr = authSrv.getCurrentUser();

  socketSrv.register('updateRoomMessage', function(msg) {
    if (msg) {
      roomSrv.addMessage(msg);
      $scope.$apply();
    }
  });

  $scope.sendMessage = function(content) {
    socketSrv.sendRoomMsg({
      username: curr.username,
      userid: curr.id,
      content: content
    });
  };

  $scope.$watchCollection('messages', function() {
    $scope.scrollBottom();
  });
}
