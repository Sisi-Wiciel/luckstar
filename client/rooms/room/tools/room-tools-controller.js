'use strict';

require('./room-tools.css');
module.exports = ['$scope', function($scope) {
  $scope.roomstatVisiable = false;

  $scope.showRoomStat = function() {
    if ($scope.roomstatVisiable) {
      $scope.updateRoomstat();
    }
    $scope.roomstatVisiable = !$scope.roomstatVisiable;
  };
}];
