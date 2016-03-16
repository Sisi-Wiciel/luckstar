define([
  'angular',
  'settings',
  'jquery',
  'lodash',
  'moment',
  'moment-zh',
  'require',
  'bootstrap',
  'angular-ui-route',
  'angular-animate',
  'angular-cookie',
  'angular-sanitize',
  'angular-strap',
  'angular-strap-tpl'
],
function(angular, settings, $, _, moment) {
  'use strict';

  var componentRequires = [
    'common/all',
    'rooms/all',
    'topics/all',
    'users/all',
    'components/all',
    'components/all'
  ];

  var appDeps = [
    'luckStar',
    'luckStar.rooms',
    'luckStar.topics',
    'luckStar.users'
  ];

  moment.locale('zh-cn');

  var app = angular.module('luckStar', [
    'ui.router',
    'ngCookies',
    'ngAnimate',
    'ngSanitize',
    'mgcrea.ngStrap']);

  app.config(function($stateProvider, $urlRouterProvider, $httpProvider,
                      $locationProvider, $urlMatcherFactoryProvider) {
    var ROOT_PATH = '/';
    $urlRouterProvider.otherwise(ROOT_PATH);
    $stateProvider.state('index', {
      url: '/',
      templateUrl: 'index-tpl.html'
    }).state('home', {
      templateUrl: '/home-tpl.html',
      controller: 'homeCtrl',
      resolve: {
        user: function(socketSrv, navbarSrv, authSrv, $q, $rootScope, $timeout) {
          return $q(function(resolve, reject) {
            $timeout(function() {
              console.info("open socket");
              socketSrv.open(function() {
                console.info("get current user");
                authSrv.updateCurrentUser();
                resolve();
              }, function() {
                $rootScope.goto(ROOT_PATH);
              });
            })
          });
        }
      }
    }).state('home.index', {
      url: '/home',
      templateUrl: 'home.html'
    });

    $locationProvider.html5Mode(true);
    $urlMatcherFactoryProvider.strictMode(false);
    $httpProvider.interceptors.push('authInterceptor');
  }).factory('authInterceptor', function($rootScope, $q, store, $window,
                                         $location) {
    return {
      request: function(config) {
        config.headers = config.headers || {};
        if (store.get('token')) {
          config.headers.Authorization = 'Bearer ' + store.get('token');
        }
        return config;
      }

      //responseError: function(response) {
      //  console.info('response error', response.status);
      //  if (response.status === 400) {
      // maybe timeout issue
      //$window.location = '/';
      //
      //// 登录系统后, 没有ajax请求.
      //$location.path('/');
      //store.delete('token');
      //}


      //return $q.reject(response);
      //}
    };
  }).boot = function(cb) {
    require(componentRequires, function() {
      (cb || function() {
        angular.element(document).ready(function() {

          angular.bootstrap(document, appDeps).invoke([
            '$rootScope',
            '$location',
            '$timeout',
            '$window',
            'store',
            function($rootScope, $location, $timeout, $window, store) {
              var debug = true;
              $rootScope.goto = function(path) {
                $location.path(path);
                $timeout(function() {
                  if ($window.location.pathname !== path) {
                    $window.location = '/?t=inactive';
                  }
                }, 500);
              };

              if (settings.debug) {
                $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                  console.log('$stateChangeStart to ' + toState.to + '- fired when the transition begins. toState,toParams : \n', toState, toParams);
                });

                $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams) {
                  console.log('$stateChangeError - fired when an error occurs during transition.');
                  console.log(arguments);
                });

                $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                  console.log('$stateChangeSuccess to ' + toState.name + '- fired once the state transition is complete.');
                });

                $rootScope.$on('$viewContentLoaded', function(event) {
                  console.log('$viewContentLoaded - fired after dom rendered', event);
                });

                $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {
                  console.log('$stateNotFound ' + unfoundState.to + '  - fired when a state cannot be found by its name.');
                  console.log(unfoundState, fromState, fromParams);
                });
              }
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
      })();
    });
  };

  app.factory('store', function($window) {
    return {
      get: function(key) {
        return $window.localStorage[key];
      },
      set: function(key, value) {
        $window.localStorage[key] = value;
      },

      delete: function(key) {
        $window.localStorage.removeItem(key);
      },
      exists: function(key) {
        return this.get(key) !== undefined;
      }
    };

  });

  app.factory('httpq', function($http, $q) {
    return {
      get: function() {
        var deferred = $q.defer();
        $http.get.apply(null, arguments)
        .success(deferred.resolve)
        .error(deferred.reject);
        return deferred.promise;
      },
      post: function() {
        var deferred = $q.defer();
        $http.post.apply(null, arguments)
        .success(deferred.resolve)
        .error(deferred.reject);
        return deferred.promise;
      }
    };
  });
  return app;
});

