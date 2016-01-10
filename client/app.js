define([
        'angular',
        'settings',
        'jquery',
        'moment',
        'moment-zh',
        'lodash',
        'require',
        'bootstrap',
        'angular-ui-route',
        'angular-cookie',
        'angular-animate',
        'angular-sanitize',
        'angular-resource',
        'angular-strap',
        'angular-strap-tpl'
    ],
    function (angular, settings, $, moment) {
        "use strict";

        var componentRequires = [
            'common/all',
            'rooms/all',
            'topics/all',
            'users/all',
            'components/all',
            'components/all'
        ];

        var apps_deps = [
            'luckStar',
            'luckStar.rooms',
            'luckStar.topics',
            'luckStar.users'
        ];

        moment.locale('zh-cn');

        var app = angular.module('luckStar', ['ui.router', 'ngAnimate', 'ngResource', 'ngSanitize', 'mgcrea.ngStrap']);

        app.config(function ($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {

            $urlRouterProvider.otherwise("/");
            $stateProvider
                .state('index', {
                    url: "/",
                    templateUrl: "index-tpl.html"
                })
                .state('home', {
                    templateUrl: '/home-tpl.html',
                    controller: 'mainCtrl',
                    resolve: {
                        user: function (authSrv) {
                            return authSrv.getCurrentUser().$promise;
                        }
                    }
                })
                .state('home.index', {
                    url: "/home",
                    templateUrl: 'home.html'
                });

            $locationProvider.html5Mode(true);
            $httpProvider.interceptors.push('authInterceptor');
        })
            .factory('authInterceptor', function ($rootScope, $q, store, $window, $location) {
                return {
                    request: function (config) {
                        config.headers = config.headers || {};
                        if (store.get('token')) {
                            config.headers.Authorization = 'Bearer ' + store.get('token');
                        }
                        return config;
                    },

                    responseError: function (response) {
                        console.info("response error", response.status);
                        if (response.status === 401) {//auth failed
                            store.delete('token');
                            $location.path('/');
                            return $q.reject(response);
                        }
                        else if (response.status === 400) {// maybe timeout issue
                            store.delete('token');
                            $window.location = '/';
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
                                        function (event, toState, toParams, fromState, fromParams) {

                                            if (_.startsWith(toState.url, '/home') && !store.get('token')) {
                                                //event.preventDefault();
                                                console && console.hasOwnProperty("info") && console.info("no token, redirect to /");
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
