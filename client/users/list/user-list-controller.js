'use strict';

require('./user-list.css');
require('./user-list.html');
module.exports = ['$scope', 'socketSrv', 'authSrv', 'messageCenter', 'roomSrv', function($scope, socketSrv, authSrv, messageCenter, roomSrv) {
  $scope.messages = [];
  $scope.toUser = {};
  $scope.room = roomSrv.getCurrentRoom();

  $scope.statusList = [
    {display: '全部', value: -1, cls: 'fa-user'},
    {display: '离线', value: 0, cls: 'fa-circle text-muted'},
    {display: '在线', value: 1, cls: 'fa-circle text-success'},
    {display: '繁忙', value: 2, cls: 'fa-circle text-danger'}
  ];

  $scope.status = $scope.statusList[0];
  $scope.userlist = [];

  $scope.curr = authSrv.getCurrentUser();

  socketSrv.register('updateUsers', function(users) {
    _.assign($scope.userlist, users);
    $scope.$apply();
  });

  $scope.showChatPanel = function(to) {
    $scope.toUser = to;
    if (!$scope.messages[to.id]) {
      $scope.messages[to.id] = [];
    }
    $scope.chatting = true;
  };

  $scope.hideChatPanel = function() {
    $scope.chatting = false;
    $scope.toUser = {};
  };

  $scope.inviteUser = function(user) {
    socketSrv.inviteUser(user.id);
  };

  socketSrv.register('updateMessage', function(item) {
    if (!$scope.messages[item.from.id]) {
      $scope.messages[item.from.id] = [];
    }
    $scope.messages[item.from.id].push(item);

    if (item.from.id !== $scope.toUser.id) {
      messageCenter.confirm(item.from.username + '对你说: ' + item.content, 'Chat-with-' + item.from.username)
      .then(function() {
        $scope.showChatPanel(item.from);
      });
    }

    $scope.message = item;
    $scope.$apply();
  });

  $scope.sendMsg = function(msg) {
    socketSrv.sendMsg({
      content: msg,
      to: $scope.toUser.id
    });
  };

  socketSrv.userOnline($scope.curr.id);
}];
