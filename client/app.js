define([
    'angular',
    'jquery',
    'lodash',
    'require',
    'bootstrap',
    'angular-ui-route',
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

    var app = angular.module('luckStar', ['ui.router', 'ngAnimate', 'ngResource', 'ngSanitize'/*, 'ui.bootstrap'*/]);

    app.config(function ($stateProvider, $httpProvider, $locationProvider) {

        $stateProvider
          .state('index', {
            abstract: true,
            templateUrl: "/auth.html"
          })
          .state('home', {
            //url: "/home",
            template: '<div class="container" >' +
            '<header ng-include src="\'/components/navbar/navbar.html\'"></header>' +
            '<div ui-view></div> </div> ',

          })
          .state('home.index', {
            url: "/home",
            templateUrl: 'home.html'
          });

        $locationProvider.html5Mode(true);
        $httpProvider.interceptors.push('authInterceptor');
      })
      .factory('authInterceptor', function ($rootScope, $q, store, $location) {
        return {
          request: function (config) {
            config.headers = config.headers || {};
            if (store.get('token')) {
              config.headers.Authorization = 'Bearer ' + store.get('token');
            }
            return config;
          },

          responseError: function (response) {
            if (response.status === 401) {
              $location.path('/');
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
                .invoke(['$rootScope', '$location', 'store', function ($rootScope, $location, store) {
                  $rootScope.$on('$stateChangeSuccess',
                    function(event, toState, toParams, fromState, fromParams){
                      if(_.startsWith(toState.url, '/home') && !store.get('token')){
                        //event.preventDefault();
                        $location.path('/');
                      }
                    })
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
