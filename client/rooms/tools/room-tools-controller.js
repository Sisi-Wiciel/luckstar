define([
  'angular',
  'lodash',
  '../room'
], function(angular, _, app) {
  'use strict';

  app.controller('roomToolsCtrl', function($scope, roomSrv) {
    $scope.roomstatVisiable = false;

    $scope.showRoomStat = function() {
      if ($scope.roomstatVisiable) {
        roomSrv.updateState();
      }
      $scope.roomstatVisiable = !$scope.roomstatVisiable;
    };
  });

});
