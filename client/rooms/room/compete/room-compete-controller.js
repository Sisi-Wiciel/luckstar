'use strict';

require('./room-compete.css');
module.exports = ['$scope', '$timeout', 'socketSrv', 'authSrv', 'roomSrv', function($scope, $timeout, socketSrv,
                                                                                    authSrv, roomSrv) {
  $scope.countdown = 0;
  roomSrv.onEndCompetition(function() {
    $scope.countdown = 0;
    $scope.topic = null;
    authSrv.updateCurrentUser();
  });

  socketSrv.register('topicUpdate', function(topic) {
    $scope.topic = null;
    $timeout(function() {
      $scope.topic = topic;
      
    });
    $scope.countdown = 0;
    $scope.$apply();
  });
  socketSrv.register('StartCompeteCountDown', function(countdown) {
    $scope.countdown = countdown;
    roomSrv.addMessage(countdown + "秒后开始...");
    $scope.$apply();
  });
  // Fix F5 issue
  // $scope.updateRoomstat();
  socketSrv.getCompeteTopic();
}];
