define([
  'angular'
], function (angular) {
  "use strict";

  var topics = angular.module('luckStar.topics', []);

  topics.config(function ($stateProvider) {

    $stateProvider.state('home.topic', {
      url: '/home/topic',
      templateUrl: '/topics/topic.html',
      controller: 'topicCtrl'
    });
  });
  return topics;
});
