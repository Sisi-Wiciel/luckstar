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
    '$mdSidenav',
    '$mdMedia',
    'authSrv',
    function($rootScope, $location, $timeout, $window, store, $mdSidenav, $mdMedia, authSrv) {
      $rootScope.currentUser = authSrv.getCurrentUser();

      $rootScope.$watch(function() {
        return $mdMedia('gt-md');
      }, function(big) {
        $rootScope.bigScreen = big;
      });

      $rootScope.toggleSidenav = function(componentId) {
        $mdSidenav(componentId).toggle();
      };
      $rootScope.openSidenav = function(componentId) {
        return $mdSidenav(componentId).open()
      };
      $rootScope.isOpenSidenav = function(componentId) {
        return $mdSidenav(componentId).isOpen();
      };

      $rootScope.goto = goto;

      $rootScope.$on('$stateChangeSuccess', function(event, toState) {
        if (_.startsWith(toState.url, '/home')) {
          if (!store.exists('token')) {
            console.info('no token and exist')
            goto('/');
          }
        }
      });


      function goto(path) {
        if (path) {
          $location.path(path);
          $timeout(function() {
            if ($window.location.pathname !== path) {
              $window.location = '/';
            }
          }, 500);
        }
      }
    }]);
});
