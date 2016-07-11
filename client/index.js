'use strict';

require('../node_modules/angular-material/angular-material.min.css');
require('../node_modules/material-design-icons/iconfont/material-icons.css');

angular.element(document).ready(function() {
  var appDeps = [
    require('./core/app'),
    require('./components'),
    require('./unauth'),
    require('./users'),
    require('./home'),
    require('./rooms'),
    require('./topics')
  ];
  angular.bootstrap(document, appDeps).invoke(bootstrapApp);
});

/* @ngInject */
function bootstrapApp($rootScope, $location, $timeout, $window, store, $mdSidenav, $mdMedia, authSrv, socketSrv) {
  $rootScope.currentUser = authSrv.getCurrentUser();

  $rootScope.toggleSidenav = function(componentId) {
    $mdSidenav(componentId).toggle();
  };
  $rootScope.openSidenav = function(componentId) {
    return $mdSidenav(componentId).open();
  };
  $rootScope.isOpenSidenav = function(componentId) {
    return $mdSidenav(componentId).isOpen();
  };
  $rootScope.changeUserStatus = socketSrv.changeUserStatus.bind(socketSrv);
  $rootScope.goto = goto;

  $rootScope.screen = $mdMedia;
  $rootScope.$on('$stateChangeSuccess', function(event, toState) {
    if (_.startsWith(toState.url, '/home')) {
      if (!store.exists('token')) {
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
}
