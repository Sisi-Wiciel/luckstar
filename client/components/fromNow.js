define([
    'angular',
    'lodash',
    'app',
    'moment'
], function (angular, _, app, moment) {
    "use strict";
    app.filter('fromNow', function () {
        return function(input){
            return moment(input).fromNow();
        }
    });
});