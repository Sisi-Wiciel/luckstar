'use strict';

require('./room-compete.css');
module.exports = ['$scope', '$timeout', 'socketSrv', 'authSrv', 'roomSrv', function($scope, $timeout, socketSrv, authSrv, roomSrv) {
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
  $scope.updateRoomstat();
  socketSrv.getTopic();
}];
