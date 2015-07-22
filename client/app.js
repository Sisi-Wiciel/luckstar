define([
    'angular',
    'jquery',
    'lodash',
    'require',
    'bootstrap',
    'angular-route',
    'angular-cookie',
    'angular-animate',
    'angular-sanitize',
    'angular-resource',
    //'angular-bootstrap',
    //'angular-bootstrap-tpls',
  ],
  function (angular) {
    "use strict";

    var componentRequires = [
      'common/all',
      'matches/all',
      'topics/all',
      'users/all',
      'components/all'
    ];

    var apps_deps = [
      'luckStar',
      'luckStar.matches',
      'luckStar.topics',
      'luckStar.users',
    ];

    var app = angular.module('luckStar', ['ngRoute', 'ngAnimate', 'ngResource', 'ngSanitize'/*, 'ui.bootstrap'*/]);

    app.config(function ($routeProvider, $provide, $httpProvider, $locationProvider) {
      //$routeProvider
      //  .when('/', {
      //    templateUrl: 'home.html',
      //  })

      $locationProvider.html5Mode(true);
      $httpProvider.interceptors.push('authInterceptor');
    })
      .factory('authInterceptor', function ($rootScope, $q, store, $location) {
        return {
          // Add authorization token to headers
          request: function (config) {
            config.headers = config.headers || {};
            if (store.get('token')) {
              config.headers.Authorization = 'Bearer ' + store.get('token');
            }
            return config;
          },

          // Intercept 401s and redirect you to login
          responseError: function (response) {
            if (response.status === 401) {
              $location.path('/login');
              store.delete('token');
              return $q.reject(response);
            }
            else {
              return $q.reject(response);
            }
          }
        };
      })
      .boot = function (cb) {
      require(componentRequires, function () {
        (cb || function () {
          angular
            .element(document)
            .ready(function () {
              angular.bootstrap(document, apps_deps)
                .invoke(['$rootScope', function ($rootScope) {
                }]);
            });
        })();
      });
    };

    app.factory('store', function ($window) {
      return {
        get: function (key) {
          return $window.localStorage[key];
        },
        set: function (key, value) {
          $window.localStorage[key] = value;
        },
        getBool: function (key) {
          return $window.localStorage[key] === 'true' ? true : false;
        },
        delete: function (key) {
          $window.localStorage.removeItem(key);
        },
        deleteAll: function () {
          $window.localStorage.clear();
        }

      };

    });

    app.factory('httpq', function ($http, $q) {
      return {
        get: function () {
          var deferred = $q.defer();
          $http.get.apply(null, arguments)
            .success(deferred.resolve)
            .error(deferred.reject);
          return deferred.promise;
        },
        post: function () {
          var deferred = $q.defer();
          $http.post.apply(null, arguments)
            .success(deferred.resolve)
            .error(deferred.reject);
          return deferred.promise;
        }
      }
    });
    return app;
  });
