define([
    'angular',
    'app',
], function (angular, app) {
    "use strict";

    app.directive('userProfile', function () {

        return {
            scope: {
              user: "="
            },
            templateUrl: 'components/users/profile/user-profile.html',

            controller: function ($scope) {

            }
        }
    })

});
