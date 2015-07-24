define([
  'angular'
], function (angular) {
  "use strict";

  var matches = angular.module('luckStar.matches', []);


  matches.config(function ($stateProvider) {
    $stateProvider.state('home.match', {
      url: '/home/match',
      templateUrl: '/matches/match.html',
      controller: 'matchCtrl',
    });
  });
  return matches;
});
