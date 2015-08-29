define([
    'angular',
    'lodash',
    'app'
], function (angular, _, app) {
    "use strict";
    app.directive('focusMe', function ($timeout, $parse) {
        return {
            link: function (scope, element, attrs) {
                $timeout(function() {
                    $(element).focus();
                })
            }
        };
    });
});