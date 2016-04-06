'use strict';

require('./unauth.css');

module.exports = angular.module('luckstar.unauth', [])
.config(['$stateProvider', function($stateProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    controller: require('./unauth-controller'),
    template: require('./unauth-tpl.html')
  });
}])
.name;
