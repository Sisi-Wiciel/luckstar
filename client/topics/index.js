'use strict';

module.exports = angular.module('luckstar.topics', [])
.config(['$stateProvider', function($stateProvider) {
  $stateProvider.state('home.topic', {
    url: '/home/topic',
    controller: 'topicCtrl',
    template: require('./topic.html')
  }).state('home.topic.commit', {
    url: '/commit',
    controller: 'topicCommitCtrl',
    template: require('./commit/topic-commit.html')
  });
}])
.directive('topicPreview', require('./commit/preview/topic-preview-directive'))
.directive('topicPanel', require('./pannel/topic-panel-directive'))
.controller('topicCtrl', require('./topic-controller'))
.controller('topicCommitStatusCtrl', require('./commit/preview/topic-commit-status-controller'))
.controller('topicCommitCtrl', require('./commit/topic-commit-controller')).name;
