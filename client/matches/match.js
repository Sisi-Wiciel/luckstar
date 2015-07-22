define([
  'angular'
], function (angular) {
  "use strict";

  var matches = angular.module('luckStar.matches', []);

  matches.config(function ($routeProvider) {
    $routeProvider.when('/', {
      templateUrl: '/matches/match.html',
      controller: 'matchCtrl',
      //resolve: {
      //  current: function(auth, $q){
      //
      //  }
      //}
    });

  });
  return matches;
});
