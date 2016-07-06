'use strict';

require('./room-statistic.css');

module.exports = ['$timeout', function($timeout) {
  return {
    scope: {
      room: '='
    },
    template: require('./room-statistic.html'),
    controller: ['$scope', 'roomSrv', 'socketSrv',function($scope, roomSrv, socketSrv) {
      $scope.statTable = false;
      $scope.roomstat = {};
      $scope.userColors = roomSrv.getUserColor();
      socketSrv.getRoomStat().then(function(result) {
        $scope.roomstat = result;
      });
    }],
  };
}];
