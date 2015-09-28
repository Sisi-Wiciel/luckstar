define([
    'angular',
    'lodash',
    'app',
    'moment'
], function (angular, _, app, moment) {
    "use strict";
    app.directive('comfirm', function ($modal) {
        return {
            restrict: 'A',
            scope: {
                ngClick: '&',
            },
            link: function (scope, ele, attr) {
                ele.unbind('click').bind('click', function () {
                    var _modal = $modal({
                        templateUrl: 'components/utils/comfirm-tpl.html',
                        'controller': function ($scope) {
                            $scope.data = {
                                content: attr.comfirm,
                                okBtn: '确认'
                            };

                            $scope.comfirm = scope.ngClick;

                        },
                        show: true
                    });
                    //_modal.$promise.then(myOtherModal.show);
                });
            }
        }
    })
});