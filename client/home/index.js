'use strict';

module.exports = angular.module('luckstar.home', [])
.controller('homeCtrl', require('./home-controller'))
.controller('navbarCtrl', require('./navbar/navbar-controller'))
.config(['$stateProvider', function($stateProvider) {
  $stateProvider
  .state('home', {
    template: require('./home-tpl.html'),
    controller: 'homeCtrl',
    resolve: {
      user: ['socketSrv', 'authSrv', '$q', '$rootScope', '$timeout', function(socketSrv, authSrv, $q, $rootScope, $timeout) {
        return $q(function(resolve) {
          $timeout(function() {
            socketSrv.open(function() {
              authSrv.updateCurrentUser();
              resolve();
            }, function() {
              $rootScope.goto('/');
            });
          });
        });
      }]
    }
  })
  .state('home.index', {
    url: '/home',
    template: require('./home.html')
  });
}]).name;
