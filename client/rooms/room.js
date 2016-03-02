define([
  'angular'
], function(angular) {
  'use strict';

  var compete = angular.module('luckStar.rooms', []);

  compete.config(function($stateProvider) {
    $stateProvider.state('home.rooms', {
      url: '/home/rooms',
      templateUrl: '/rooms/room-list.html'
    })
    .state('home.room', {
      url: '/home/rooms/:id',
      templateUrl: '/rooms/room.html',
      controller: 'roomCtrl'
    });
  });
  return compete;
});
