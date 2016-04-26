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
            $window.location = '/';
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
