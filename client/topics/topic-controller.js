'use strict';

require('./topic.less');
module.exports = ['$scope', 'socketSrv', function($scope, socketSrv) {
  $scope.topicTotalSize = 0;
  socketSrv.getTopicSize().then(function(size) {
    $scope.topicTotalSize = size;
  });
}];
