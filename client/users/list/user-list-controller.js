'use strict';

require('./user-list.css');
require('./user-list.html');
module.exports = ['$scope', 'socketSrv', 'authSrv', 'messageCenter', 'roomSrv', function($scope, socketSrv, authSrv,
                                                                                         messageCenter, roomSrv) {
  var EVENT_RECEIVED_MESSAGE = 'MessageReceivedEvent';

  $scope.room = roomSrv.getCurrentRoom();

  $scope.userlist = [];

  $scope.curr = authSrv.getCurrentUser();

  socketSrv.register('updateUsers', function(users) {
    $scope.userlist = users;
    $scope.$apply();
  });

  $scope.toggleChat = function(to) {
    if($scope.toUser && $scope.toUser.id === to.id){
      //Close chat
      $scope.toUser = null;
    }else{
      //Open chat
      $scope.toUser = to;
    }
  };

  $scope.inviteUser = function(user) {
    if (_.find($scope.room.users, {id: user.id})) {
      messageCenter.error('用户已经进入房间中');
    } else {
      socketSrv.inviteUser(user.id);
      messageCenter.notify('已发送对用户<b>' + user.username + '</b>邀请');
      socketSrv.register('inviteUserResponse', function(result) {
        if (result.response === 0) {
          messageCenter.notify('用户<b>' + result.username + '</b>拒绝您的邀请');
        }
      });
    }
  };

  socketSrv.register('updateMessage', function(item) {
    console.info('update message', item);
    if($scope.isOpenSidenav($scope.USER_LIST_MENU_NAME) && $scope.toUser && item.from.id === $scope.toUser.id){
      $scope.$broadcast(EVENT_RECEIVED_MESSAGE, item);
    }else{
        var content = item.from.username + '对你说: ' + item.content;
        messageCenter.confirm(content, 'Chat-with-' + item.from.username)
        .then(function() {
          $scope.openSidenav($scope.USER_LIST_MENU_NAME).then(function() {
            if(!$scope.toUser || item.from.id !== $scope.toUser.id){
              $scope.toggleChat(item.from);
            }
            $scope.$broadcast(EVENT_RECEIVED_MESSAGE, item);
          });
        });
    }


    $scope.$apply();
  });

  socketSrv.userOnline($scope.curr.id);
}];
