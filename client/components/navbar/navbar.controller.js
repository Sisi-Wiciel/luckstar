define([
    'angular',
    'app'
], function (angular, app) {
    'use strict';

    app.controller('NavbarCtrl', function ($scope, $location, socketSrv, authSrv) {
        $scope.menu = [{
            'title': '首页',
            'link': '/home',
            'icon': 'fa-home'
        },{
            'title': '题目',
            'link': '/home/topic',
            'icon': 'fa-book'
        }];
        $scope.user = authSrv.getCurrentUser();

        $scope.isCollapsed = true;

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

        socketSrv.register("updateUser", function(user){
            $scope.user = user;
        })
    });
});
