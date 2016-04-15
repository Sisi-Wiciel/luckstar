'use strict';

var appDeps = [
  require('./core/app'),
  require('./components'),
  require('./unauth'),
  require('./users'),
  require('./home'),
  require('./rooms'),
  require('./topics')
];

 require('bootstrap/less/bootstrap.less');
//require('angular-material/../angular-material.min.css');
require('font-awesome/less/font-awesome.less');
require('normalize.css/normalize.css');
require('./libs/less/animate.less');
require('./libs/less/lesshat.less');
require('./components/utils/message/messenger.css');
require('./components/utils/message/messenger-theme-future.css');

angular.element(document).ready(function() {
  angular.bootstrap(document, appDeps).invoke([
    '$rootScope',
    '$location',
    '$timeout',
    '$window',
    'store',
    function($rootScope, $location, $timeout, $window, store) {
      $rootScope.goto = function(path) {
        $location.path(path);
        $timeout(function() {
          if ($window.location.pathname !== path) {
            $window.location = '/?t=inactive';
          }
        }, 500);
      };

      $rootScope.$on('$stateChangeSuccess',
      function(event, toState) {
        if (_.startsWith(toState.url, '/home')) {
          if (!store.exists('token')) {
            $rootScope.goto('/');
          }
        }
      });
    }]);
});
