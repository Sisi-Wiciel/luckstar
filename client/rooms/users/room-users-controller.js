define([
  'angular',
  'lodash',
  '../room'
], function(angular, _, app) {
  'use strict';

  app.controller('roomUsersCtrl', function($scope, $q, messageCenter, authSrv, socketSrv, roomSrv) {

    $scope.curr = authSrv.getCurrentUser();

    var userStatusColors = {
      ONLINE: '#73e252',
      OFFLINE: '#767676',
      UNREADY: '#f88d00',
      READY: '#73e252'
    };
    $scope.start = function() {
      // $q.reject() 用户reload btn loading文字
      if (_.isEmpty($scope.room.readyUsers)) {
        messageCenter.alert('用户准备就绪后,才可以开始');
        return $q.reject();
      }
      console.info($scope.room.users)
      var notReadyUsers = _.filter($scope.room.users, function(user) {
        return user && !_.includes($scope.room.readyUsers, user.id);
      });

      if (!_.isEmpty(notReadyUsers)) {
        messageCenter.alert('用户准备就绪后,才可以开始.');
        //messageCenter.alert('用户 ' + _.map(notReadyUsers, 'username').join(',') + ' 未准备.');
        return $q.reject();
      }

      socketSrv.startCompete();
    };

    $scope.getUserStatusColor = function(user) {
      if(user.status === "0"){
        return userStatusColors.OFFLINE;
      }

      if (!roomSrv.isCompeting()) {
        return $scope.isReady(user.id) ? userStatusColors.READY : userStatusColors.UNREADY;
      }

      return userStatusColors.ONLINE;

    };

    $scope.isReady = function(userid) {
      return _.includes($scope.room.readyUsers, userid || $scope.curr.id);
    };
    $scope.ready = function() {
      socketSrv.readyCompete();
    };
    $scope.unReady = function() {
      socketSrv.unreadyComplate();
    };
    $scope.terminate = function() {
      socketSrv.terminateCompete();
    };


  });
  /* link: function (scope, ele) {
   scope.reorder = function () {
   $timeout(function () {
   var orderedUserList = _.sortByOrder(scope.room.users, 'gpoint', false);
   var $el = $(ele);
   $el.find('.user').each(function (index, user) {
   var $user = $(user);

   var newIndex = _.findIndex(orderedUserList, 'id', $user.data('userid'));
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

   }*/
});
