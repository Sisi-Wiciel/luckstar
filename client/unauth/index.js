'use strict';

require('./index.less');

module.exports = angular.module('luckstar.unauth', [])
.config(authConfig)
.name;

/* @ngInject */
function authConfig($stateProvider) {
  $stateProvider
  .state('index', {
    url: '/',
    controller: require('./unauth-controller'),
    template: require('./unauth-tpl.html')
  });
}
