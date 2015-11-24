define([
    'angular',
    'app'
], function (angular, app) {
    'use strict';

    app.controller('NavbarCtrl', function ($scope, $location, authSrv) {
        $scope.menu = [{
            'title': '首页',
            'link': '/home',
            'icon': 'fa-home'
        }, {
            'title': '答题',
            'link': '/home/rooms',
            'icon': 'fa-star'
        }, {
            'title': '题目',
            'link': '/home/topic',
            'icon': 'fa-book'
        }];

        $scope.isCollapsed = true;
        $scope.isLoggedIn = authSrv.isLoggedIn;
        $scope.getCurrentUser = authSrv.getCurrentUser;

        $scope.logout = function () {
            authSrv.logout();
            $location.path('/login');
        };

        $scope.goto = function (item) {
            $location.path(item.link);
        };

        $scope.isActive = function (route) {
            return route === $location.path();
        };
    });
});
