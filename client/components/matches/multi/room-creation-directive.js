define([
        'angular',
        'app',
        'lodash',
        'jquery'
    ],
    function (angular, app, _, $) {
        'use strict';

        app.directive('roomCreation', function () {

            return {
                templateUrl: "components/matches/multi/room-creation.html",
                controller: function ($scope) {

                },
                link: function (scope, elem, attr) {

                }
            };
        });
    });