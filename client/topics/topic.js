define([
  'angular'
], function (angular) {
  "use strict";

  var topics = angular.module('luckStar.topics', []);

  topics.config(function ($routeProvider) {
    $routeProvider.when('/topic/contribute', {
      templateUrl: '/topics/topic.html',
      controller: 'topicCtrl',
    });

  });
  return topics;
});
