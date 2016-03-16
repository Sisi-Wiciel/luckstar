define([
  'angular',
  'lodash',
  '../room'
], function(angular, _, app) {
  'use strict';

  app.controller('roomToolsCtrl', function($scope) {
    $scope.roomstatVisiable = false;

    $scope.showRoomStat = function() {
      if ($scope.roomstatVisiable) {
        $scope.updateRoomstat();
      }
      $scope.roomstatVisiable = !$scope.roomstatVisiable;
    };
  });
});
