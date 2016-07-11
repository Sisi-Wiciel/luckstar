'use strict';

require('./room-statistic.less');

module.exports = function() {
  return {
    scope: {
      room: '='
    },
    template: require('./room-statistic.html'),
    controller: roomStatCtrl
  };
};

/* @ngInject */
function roomStatCtrl($scope, roomSrv, socketSrv) {
  $scope.statTable = false;
  $scope.roomstat = {};
  $scope.userColors = roomSrv.getUserColor();
  socketSrv.getRoomStat().then(function(result) {
    $scope.roomstat = result;
  });
}
