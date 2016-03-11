define([
  'angular',
  'lodash',
  './room'
],
function(angular, _, app) {
  'use strict';

  app.controller('roomCompeteCtrl', function($scope, $timeout, socketSrv, authSrv, roomSrv) {
    $scope.roomstat = roomSrv.getRoomStat();
    roomSrv.onEndCompetition(function() {
      $scope.topic = null;
      authSrv.updateCurrentUser();
    });

    socketSrv.register('topicUpdate', function(topic) {
      // we need a new topic for the typing animation.
      $scope.topic = null;
      $timeout(function() {
        $scope.topic = topic;
      });

      $scope.$apply();
    });

    // Fix F5 issue
    socketSrv.getTopic();
  });
});
