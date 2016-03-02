define([
  'angular',
  './topic'
], function(angular, module) {
  'use strict';

  module.controller('topicCtrl', function($scope, socketSrv) {
    $scope.topicTotalSize = 0;
    socketSrv.getTopicSize().then(function(size) {
      $scope.topicTotalSize = size;
    });
  });
});
