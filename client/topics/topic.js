define([
  'angular'
], function (angular) {
  "use strict";

  var topics = angular.module('luckStar.topics', []);

  topics.config(function ($stateProvider) {
    //$routeProvider.when('/topic/contribute', {
    //  templateUrl: '/topics/topic.html',
    //  controller: 'topicCtrl',
    //});
    $stateProvider.state('home.topic', {
      url: '/home/topic',
      templateUrl: '/topics/topic.html',
      controller: 'topicCtrl',
    });
  });
  return topics;
});
