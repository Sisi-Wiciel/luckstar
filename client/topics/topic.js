define([
  'angular'
], function(angular) {
  'use strict';

  var topics = angular.module('luckStar.topics', []);

  topics.config(function($stateProvider) {
    $stateProvider.state('home.topic', {
      url: '/home/topic',
      controller: 'topicCtrl',
      templateUrl: '/topics/topic.html'
    });
  });
  return topics;
});
