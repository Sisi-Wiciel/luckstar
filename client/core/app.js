'use strict';

var app = angular.module('luckstar', ['ui.router', 'ngAnimate', 'ngMaterial', 'ngMessages']);

app.config(appConfig)
.factory('authInterceptor', authInterceptor)
.factory('store', storeFactory)
.factory('httpq', httpFactory);

module.exports = app.name;

/* @ngInject */
function appConfig($urlRouterProvider,
                   $httpProvider,
                   $locationProvider,
                   $urlMatcherFactoryProvider) {
  // $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);
  $urlMatcherFactoryProvider.strictMode(false);
  // $mdThemingProvider.theme('default').primaryPalette('cyan');

  $httpProvider.interceptors.push('authInterceptor');
}

/* @ngInject */
function authInterceptor(store) {
  return {
    request: function(config) {
      config.headers = config.headers || {};
      if (store.get('token')) {
        config.headers.Authorization = 'Bearer ' + store.get('token');
      }
      return config;
    }
  };
}

/* @ngInject */
function storeFactory($window) {
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
}

/* @ngInject */
function httpFactory($http, $q) {
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
}
