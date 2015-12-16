define([
    'angular',
    'lodash',
    '../users'
], function (angular, _, app) {
    "use strict";

    app.directive('userLogin', function () {

        return {
            templateUrl: 'users/auth/login.html',
            controller: function ($scope, $location, authSrv) {
                $scope.err = ""
                $scope.login = function (user) {
                    authSrv.login(user).then(function () {
                        $location.path('/home');
                    }, function (err) {
                        $scope.err = err.message;
                    });
                }
            },
            link: function (scope, ele) {

            }
        }
    });
});
