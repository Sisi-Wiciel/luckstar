'use strict';

module.exports = angular.module('luckstar.topics', [])
.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('home.topic', {
    url: '/home/topic',
    controller: 'topicCtrl',
    template: require('./topic.html')
  });
}])
.directive('topicPreview', require('./commit/preview/topic-preview-directive'))
.directive('topicPanel', require('./pannel/topic-panel-directive'))
.controller('topicCtrl', require('./topic-controller'))
.controller('topicCommitCtrl', require('./commit/topic-commit-controller')).name;
