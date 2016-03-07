define([
  'angular',
  'lodash',
  './room'
],
function(angular, _, app) {
  'use strict';

  app.controller('roomCompeteCtrl', function($scope, $timeout, socketSrv, authSrv, roomSrv) {
    //$scope.curr = authSrv.getCurrentUser();
    $scope.records = [];
    $scope.roomstat = roomSrv.getRoomStat();
    roomSrv.onEndCompetition(function() {
      $scope.topic = null;
    });
    //$scope.getRecordCls = function(index) {
    //  var record = $scope.records[index];
    //  if (record.verobj) {
    //    if (record.verobj.verdict === 1) {
    //      return 'correct';
    //    }
    //    if (record.verobj.verdict === 0) {
    //      return 'incorrect';
    //    }
    //    if (record.verobj.verdict === -1) {
    //      return 'passive';
    //    }
    //  }
    //  if (index + 1 === $scope.roomstat.currNum + 1) {
    //    return 'current';
    //  }
    //  return '';
    //};

    //$scope.$on('topicVerdict', function(event, verdict) {
    //  if ($scope.roomstat.maxNum > $scope.roomstat.currNum) {
    //    $scope.records[$scope.roomstat.currNum] = {
    //      verobj: verdict,
    //      topic: $scope.topic
    //    };
    //  }
    //});

    //$scope.$on('roomStatus', function(event, room) {
    //  // Cleaning resource when room closed.
    //  if (room.status === 0) {
    //    $scope.topic = null;
    //  }
    //
    //  if (room.status === 1) {
    //    // Reset records on new competition started
    //    $scope.records = [];
    //  }
    //});

    socketSrv.register('topicUpdate', function(topic) {
      // we need a new topic for the typing animation.
      $scope.topic = null;
      $timeout(function() {
        $scope.topic = topic;
        //console.info(topic);
        //$scope.$broadcast('checkable', Boolean(_.find($scope.room.users, 'id', $scope.curr.id)));
      });

      $scope.$apply();
    });

    //$scope.$on('updateRoomStats', function() {
    //  if (_.isEmpty($scope.records)) {
    //    // Fix F5 issue
    //    $scope.records = _.fill(Array($scope.roomstat.maxNum), {});
    //  }
    //});

    // Fix F5 issue
    socketSrv.getTopic();
    //socketSrv.getRoomStat();
  });
});
